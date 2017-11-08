import sys
import logging
import rds_config
import pymysql
from lambda_proxy import *
from inspect import getmembers
from pprint import pprint

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
def get_readings_handler(event, context):
    user = event['pathParameters']['user']
    unit = event['pathParameters']['unit']

    with conn.cursor() as cursor:
        cursor.execute("select UNIX_TIMESTAMP(date) from resets where user = '%(user)s' and unit = '%(unit)s' order by date desc limit 1" % {'user':user, 'unit':unit})
        row = cursor.fetchone()
        if row[0] is None:
            last_reset = 0
        else:
            last_reset = row[0]

        cursor.execute("select UNIX_TIMESTAMP(date), thermocouple_temp, cold_junction_temp from readings where user = '%(user)s' and unit = '%(unit)s' and date >= now() - INTERVAL 1 DAY and date >= FROM_UNIXTIME(%(date)s) limit 1000" %{'user':user, 'unit':unit, 'date':last_reset})
        readings = []
        for row in cursor:
            reading = {}
            reading['d'] = row[0]
            reading['t'] = row[1]
            reading['c'] = row[2]
            readings.append(reading)

    return 200, {}, readings

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

        cursor.execute("select UNIX_TIMESTAMP(date), thermocouple_temp, cold_junction_temp from readings where user = '%(user)s' and unit = '%(unit)s' and date >= now() - INTERVAL 1 DAY and date >= FROM_UNIXTIME(%(date)s) limit 1" %{'user':user, 'unit':unit, 'date':last_reset})
        row = cursor.fetchone()
        reading = {}
        if not row is None:
            reading['d'] = row[0]
            reading['t'] = row[1]
            reading['c'] = row[2]
        return 20, {}, reading

@proxy_response
def clean_future_rows_handler(event, context):
    with conn.cursor() as cursor:
        cursor.execute("delete from resets where date > now()")
        return 200, {}, {}
