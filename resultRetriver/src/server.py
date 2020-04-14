
from flask import Flask

from workerTask.main import modelInst


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)

    # a simple page that says hello
    @app.route('/')
    def hello():
        return 'Hello, World!'

    return app