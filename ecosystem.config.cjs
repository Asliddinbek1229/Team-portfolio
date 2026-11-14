// PM2 sozlamasi: serverda doimiy ishlashi, qulasa qayta ishga tushishi va qayta yuklanganda avtomatik yoqilishi uchun.
//   pm2 start ecosystem.config.cjs && pm2 save && pm2 startup
module.exports = {
  apps: [
    {
      name: 'namdu-portfolio',
      script: 'server/index.js',
      cwd: __dirname,
      instances: 1, // JSON baza bitta jarayonda ishlashi kerak
      autorestart: true,
      max_memory_restart: '400M',
      env: { NODE_ENV: 'production' },
      time: true,
    },
  ],
}
