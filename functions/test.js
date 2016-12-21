var royal4 = require('./services/royal4')({
  root: 'http://40.141.45.139:8888/scripts/cgiip.exe/WService=wise/',
  userId: 'QVR1',
  password: 'QVR1'
});

royal4.getInventory()
  .then(function(inventory) {
    console.log(inventory);
  });