import json


def proxy_response(response_handler):

    def wrapper(*args, **kwargs):
        status_code, headers, body = response_handler(*args, **kwargs)
        return {
            "isBase64Encoded": "false",
            "statusCode": status_code,
            "headers": headers,
            "body": json.dumps(body)
        }

    return wrapper


def proxy_response_list(response_handler):

    def wrapper(*args, **kwargs):
        status_code, headers, items = response_handler(*args, **kwargs)
        return {
            "isBase64Encoded": "false",
            "statusCode": status_code,
            "headers": headers,
            "body": json.dumps(
                {
                    "data": items if items else [],
                    "count": len(items) if items else 0
                }
            )
        }

    return wrapper

