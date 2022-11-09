echo_info INSTALLING-CLOUDWATCH-AGENT
wget https://s3.us-east-1.amazonaws.com/amazoncloudwatch-agent-us-east-1/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb 

echo_info INSTALLING_CLOUDWATCH_AGENT
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
echo_info CONFIGURING_CLOUDWATCH_AGENT
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/tmp/amazon-cloudwatch-agent.json -s
pwd
ls -la
cd /home/ubuntu/webapp
pwd
ls -la
# npm install
# pm2 start --name "webapp" server.js
# pm2 startup systemd
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
# pm2 save
sudo npm install
sudo pm2 start server.js
sudo pm2 startup systemd
sudo pm2 save
sudo ln -s /home/ubuntu/webapp/node-service.service /etc/systemd/system/node-service.service
sudo systemctl daemon-reload
echo "daemon-reload done"
sudo systemctl enable node-service.service
sudo systemctl start node-service.service
echo "systemctl cloudwatch agent"
sudo systemctl enable amazon-cloudwatch-agent.service
echo "complete"