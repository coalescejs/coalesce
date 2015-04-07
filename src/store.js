import Coalesce from './namespace';
import BaseClass from './utils/base_class';

/**
  Abstracts indexedDB interaction

  @class Store
*/
export default class Store extends BaseClass  {

    constructor() {
        this.db = new Dexie('CoalesceDefaultStore');
        this.db.version(1).stores({
            SessionStore: ",-"
        });

        this.db.on('error', function(err) {
            // Catch all uncatched DB-related errors and exceptions
            console.error("DEXIE ERROR", err);
        });


        this.db.open(); // After this line, database is ready to use.

        this.store = this.db.SessionStore;
    }

    /**
      Get a value from store wrapped in a promise.

      @method get
      @param {String} key 
      @return {Promise}
    */
    get(key) {
        return this.store.get(key);
    }

    /**
      Set a value into the store.

      @method get
      @param {Object} value 
      @return {Promise}
    */
    set(object, key) {
        return this.store.put(object, key);
    }

    /**
      Removes a value from the store.

      @method remove
      @param {String} id 
      @return {Promise}
    */
    remove(id) {
        return this.store.delete(id);
    }

    clear(){
      return this.store.clear();
    }
}
