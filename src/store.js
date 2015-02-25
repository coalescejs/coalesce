import Coalesce from './namespace';

/**
  Abstracts indexedDB interaction

  @class Store
*/
export default class Store {

    constructor(db_name) {
        this.db = new Dexie(db_name);
        this.db.version(1).stores({
            sessionstore: ",models,newModels,shadows,uuidStart"
        });

        this.db.on('error', function(err) {
            // Catch all uncatched DB-related errors and exceptions
            console.error("DEXIE ERROR", err);
        });


        this.db.open(); // After this line, database is ready to use.
    }

    /**
      Get a value from store wrapped in a promise.

      @method get
      @param {String} key 
      @return {Promise}
    */
    get(key) {
        return this.db.sessionstore.get(key);
    }

    /**
      Set a value into the store.

      @method get
      @param {Object} value 
      @return {Promise}
    */
    set(object, key) {
        return this.db.sessionstore.put(object, key);
    }

    /**
      Removes a value from the store.

      @method remove
      @param {String} id 
      @return {Promise}
    */
    remove(id) {
        return this.db.sessionstore.delete(id);
    }

    clear(){
      return this.db.sessionstore.clear();
    }
}
