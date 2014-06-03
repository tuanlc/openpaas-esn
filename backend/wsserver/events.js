'use strict';

var logger = require('../core/logger'),
    activitystreams = require('./notification/activitystreams');

module.exports = function(io) {
  io.sockets.on('connection', function(socket) {
    logger.info('Got a connection in the events module on socket');
  });
  activitystreams.init(io);
};
