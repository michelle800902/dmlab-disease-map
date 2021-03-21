# use following command to make run.sh runable
#     chmod 764 run.sh
source venv_ubuntu/bin/activate
python manage.py runserver 0.0.0.0:8888 >> log/server.log 2>&1 &
