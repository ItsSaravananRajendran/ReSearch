FLASK_APP=./src/server.py

setup: requirements.txt
	pip3 install -r requirements.txt 

dev: 	
	export FLASK_APP=$(FLASK_APP)
	export FLASK_ENV=development
	python -m flask run

prod:
	cd src
	waitress-serve --call 'server:create_app'
	


