
from flask import Flask

from workerTask.SearchModel import SearchModel

app = Flask(__name__, instance_relative_config=True)

modelInst = SearchModel()

@app.route('/query')
def query():
    data = request.get_json()
    result = return modelInst.getResult(data["query"],data["keywords"])
    return result;
    
if __name__ == '__main__':
    app.run(host= '0.0.0.0')