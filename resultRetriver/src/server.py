
from flask import Flask

from workerTask.main import modelInst
from celery import Celery


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
    app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'


    celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
    celery.conf.update(app.config)

    @celery.task
    def getResult(data):
        return modelInst.getResult(data["query"],data["keywords"])

    @app.route('/query')
    def query():
        data = request.get_json()
        inp = {"query":data.get('query',''), "keywords":data.get('keywords','')}
        result = getResult.delay(inp);
        return result;
        
    return app