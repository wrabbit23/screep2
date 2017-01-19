var roomController = {

    /** @param {Room} room **/
    run: function(room) {

      console.log('running the room');
      room.initMemCache(true);

  }
}
module.exports = roomController;
