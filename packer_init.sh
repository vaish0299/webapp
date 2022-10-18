#!/bin/sh

echo_info () {
    echo $1
}

# Updating packages
echo_info UPDATES-BEING-INSTALLED
sudo apt-get update

# Setting up the cli
echo_info PATH-SET-LINUX
PATH=/usr/bin:/usr/local/sbin:/sbin:/bin:/usr/sbin:/usr/local/bin:/opt/aws/bin:/root/bin

echo 'debconf debconf/frontend select Noninteractive' | sudo debconf-set-selections
sudo apt-get install -y -q
#installing node server
sudo apt-get install curl
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - &&\
sudo apt-get install nodejs

#installing mysql server
sudo apt install mysql-server -y
sudo systemctl status mysql
sudo mysql
SHOW DATABASES;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
exit
systemctl status mysql.service

sudo npm install -g pm2

mkdir /home/ubuntu/webapp
chown ubuntu:ubuntu /home/ubuntu/webapp

cd /home/ubuntu/webapp
sudo npm install
sudo pm2 start server.js
sudo pm2 startup systemd
sudo pm2 save
sudo ln -s /home/ubuntu/webapp/node-service.service /etc/systemd/system/node-service.service
sudo systemctl daemon-reload
sudo systemctl enable node-service.service
sudo systemctl start node-service.service
 
