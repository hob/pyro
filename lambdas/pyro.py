import sys
import logging
import rds_config
import pymysql
import json
from lambda_proxy import *
from inspect import getmembers
from pprint import pprint
from jinja2 import Template

#rds settings
rds_host  = "pyro2017dev.czpfwgnlj7lt.us-east-1.rds.amazonaws.com"
name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name


logger = logging.getLogger()
logger.setLevel(logging.INFO)

try:
    conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
except pymysql.err.MySQLError as e:
    logger.error('Got error {!r}, errno is {}'.format(e, e.args[0]))
    sys.exit()

logger.info("SUCCESS: Connection to RDS mysql instance succeeded")

@proxy_response
def reset(event, context):
    user = event['pathParameters']['user']
    unit = event['pathParameters']['unit']

    with conn.cursor() as cursor:
        sql = "insert into resets values('%(user)s', '%(unit)s', now())" % {'user':user, 'unit':unit}
        logger.info(sql);
        cursor.execute(sql);
        conn.commit();

    return 200, {}, {}

@proxy_response
def create_reading(event, context):
    user = event['pathParameters']['user']
    unit = event['pathParameters']['unit']
    body = json.loads(event['body'])
    thermocouple_temp = body['t']
    cold_junction_temp = body['c']

    with conn.cursor() as cursor:
        cursor.execute("insert into readings values('%(user)s', '%(unit)s', now(), '%(thermocouple_temp)s', '%(cold_junction_temp)s')" % {'user':user, 'unit':unit, 'thermocouple_temp': thermocouple_temp, 'cold_junction_temp': cold_junction_temp});
        conn.commit();

    return 200, {}, {}

def get_readings_handler(event, context):
    user = event['user']
    unit = event['unit']

    with conn.cursor() as cursor:
        cursor.execute("select UNIX_TIMESTAMP(date) from resets where user = '%(user)s' and unit = '%(unit)s' order by date desc limit 1" % {'user':user, 'unit':unit})
        row = cursor.fetchone()
        if row[0] is None:
            last_reset = 0
        else:
            last_reset = row[0]

        # The nested select takes care of selecting the correct rows using LIMIT and then reversing their order
        cursor.execute("select UNIX_TIMESTAMP(date), thermocouple_temp, cold_junction_temp from (select date, thermocouple_temp, cold_junction_temp from readings where user = '%(user)s' and unit = '%(unit)s' and date >= FROM_UNIXTIME(%(date)s) order by date desc limit 1000) as T order by date asc" %{'user':user, 'unit':unit, 'date':last_reset})
        readings = []
        for row in cursor:
            reading = {}
            reading['d'] = row[0]
            reading['t'] = row[1]
            reading['c'] = row[2]
            readings.append(reading)

    template = Template('''<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <link rel="icon" href="https://s3.amazonaws.com/pyrolambda/pyro.ico" type="image/x-icon" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
        <script src="https://d3js.org/d3.v4.min.js" language="JavaScript"></script>
        <script type="text/javascript">
          let readings = {{ readings }};
          let latestReadingEndpoint = 'https://zsz5ychlqi.execute-api.us-east-1.amazonaws.com/prod/{{ user }}/{{ unit }}/readings/latest';
        </script>
        <title>Pyro - Thermocouple Readings Visualizer</title>
      </head>
      <body>
        <div id="contentPane"></div>
        <script type="text/javascript" src="https://s3.amazonaws.com/pyrolambda/pyro.js"></script>
      </body>
    </html>''')
    logger.info(template)
    rendered = template.render(readings=readings, user=user, unit=unit)
    logger.info(rendered)
    return rendered

@proxy_response
def get_latest_reading_handler(event, context):
    user = event['pathParameters']['user']
    unit = event['pathParameters']['unit']
    with conn.cursor() as cursor:
        cursor.execute("select UNIX_TIMESTAMP(date) from resets where user = '%(user)s' and unit = '%(unit)s' order by date desc limit 1" % {'user':user, 'unit':unit})
        row = cursor.fetchone()
        if row[0] is None:
            last_reset = 0
        else:
            last_reset = row[0]

        cursor.execute("select UNIX_TIMESTAMP(date), thermocouple_temp, cold_junction_temp from ebdb.readings where user = '%(user)s' and unit = '%(unit)s' and date >= FROM_UNIXTIME(%(date)s) order by date desc limit 1" %{'user':user, 'unit':unit, 'date':last_reset})
        row = cursor.fetchone()
        reading = {}
        if not row is None:
            reading['d'] = row[0]
            reading['t'] = row[1]
            reading['c'] = row[2]
        return 200, {}, reading

@proxy_response
def get_sample_readings(event, context):
    with conn.cursor() as cursor:
        cursor.execute("select UNIX_TIMESTAMP(date), thermocouple_temp, cold_junction_temp from readings where user = 'hob' and unit = 'montecito' order by date desc limit 100")
        readings = []
        for row in cursor:
            reading = {}
            reading['d'] = row[0]
            reading['t'] = row[1]
            reading['c'] = row[2]
            readings.append(reading)

    return 200, {}, readings

@proxy_response
def clean_future_rows_handler(event, context):
    with conn.cursor() as cursor:
        cursor.execute("delete from resets where date > now()")
        return 200, {}, {}
