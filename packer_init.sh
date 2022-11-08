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

#installing node server
sudo apt-get install curl
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - &&\
sudo apt-get install nodejs
sudo apt install mysql-client-core-8.0

# #installing mysql server
# sudo apt install mysql-server -y
# sudo systemctl start mysql.service
# sudo mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'";
# systemctl status mysql.service
#installing wget
sudo apt install wget

echo_info INSTALLING-CLOUDWATCH-AGENT
wget https://s3.us-east-1.amazonaws.com/amazoncloudwatch-agent-us-east-1/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
echo_info INSTALLING_CLOUDWATCH_AGENT
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
echo_info CONFIGURING_CLOUDWATCH_AGENT
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/cloudwatch-config.json -s

sudo npm install -g pm2

mkdir /home/ubuntu/webapp
chown ubuntu:ubuntu /home/ubuntu/webapp
 
