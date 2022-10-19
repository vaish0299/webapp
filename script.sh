pwd
ls -la
cd /home/ubuntu/webapp
pwd
ls -la
npm install
pm2 start --name "webapp" server.js
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
