import os
import redis
import django
from rq import Worker, Queue, Connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

listen = ['high', 'default', 'low']

redis_url = os.getenv('REDISTOGO_URL', 'redis://localhost:6379')

conn = redis.from_url(redis_url)

django.setup()

if __name__ == '__main__':
    with Connection(conn):
        worker = Worker(map(Queue, listen))
        worker.work()