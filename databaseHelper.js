var DB_NAME = 'facebookDB';
var DB_VERSION = 1; // Use a long long for this value (don't use a float)
var DB_STORE_NAME = 'peopleCollection';

var db = null;

console.log(">> databaseHelper.js");


function openDb(success_callback) {
	console.log("openDb ...");
  	var request = indexedDB.open(DB_NAME, DB_VERSION);

	request.onsuccess = function(e) {
		var v = 1;
		db = this.result; 
		// We can only create Object stores in a setVersion transaction;
		console.log("openDb DONE");
		success_callback();
	};
	request.onerror = function (evt) {
      	console.error("openDb:", evt.target.errorCode);
    };
	request.onupgradeneeded = function (evt) {
		console.log("openDb.onupgradeneeded");
		var store = evt.currentTarget.result.createObjectStore(
			DB_STORE_NAME, { keyPath: 'username', autoIncrement: true });

			store.createIndex('id', 'id', { unique: true });
      		store.createIndex('name', 'name', { unique: false });
      		store.createIndex('username', 'username', { unique: false });
      		store.createIndex('gender', 'gender', { unique: false });
      		store.createIndex('locale', 'locale', { unique: false });
      		store.createIndex('birthday', 'birthday', { unique: false });
      		store.createIndex('work', 'work', { unique: false });
    };
};

  
function addUserInfo(userInfo, success_callback) {
    console.log("addUserInfo arguments:", arguments);

    var store = getObjectStore(DB_STORE_NAME, 'readwrite');
    var req;
    try {
      req = store.add(userInfo);
    } catch (e) {
      if (e.name == 'DataCloneError')
        console.log("ERROR: This engine doesn't know how to clone a Blob, " +
                             "use Firefox");
      throw e;
    }
    req.onsuccess = function (evt) {
      console.log("Insertion in DB successful");
      //alert("Insertion in DB successful");
      //displayActionSuccess();
      //displayPubList(store);
      success_callback();
    };
    req.onerror = function() {
      console.error("addUserInfo error", this.error);
      //displayActionFailure(this.error);
    };
};  

  /**
   * @param {number} key
   * @param {IDBObjectStore=} store
   */
   function deleteUserInfo(username, store) {
    console.log("deleteUserInfo:" + username);

    if (typeof store == 'undefined') {
    	store = getObjectStore(DB_STORE_NAME, 'readwrite');
    }
      

    // As per spec http://www.w3.org/TR/IndexedDB/#object-store-deletion-operation
    // the result of the Object Store Deletion Operation algorithm is
    // undefined, so it's not possible to know if some records were actually
    // deleted by looking at the request result.
    var req = store.get(username);
    req.onsuccess = function(evt) {
      var record = evt.target.result;
      console.log("record:", record);
      if (typeof record == 'undefined') {
        console.log("No matching record found");
        return;
      }
      // Warning: The exact same key used for creation needs to be passed for
      // the deletion. If the key was a Number for creation, then it needs to
      // be a Number for deletion.
      req = store.delete(username);
      req.onsuccess = function(evt) {
        console.log("evt:", evt);
        console.log("evt.target:", evt.target);
        console.log("evt.target.result:", evt.target.result);
        console.log("delete successful");
        //displayActionSuccess("Deletion successful");
        console.log(">>>>> Deletion successful");
        //displayPubList(store);
      };
      req.onerror = function (evt) {
        console.error("deleteUserInfo:", evt.target.errorCode);
      };
    };
    req.onerror = function (evt) {
      console.error("deleteUserInfo:", evt.target.errorCode);
      };
  };
  
function displayAllData() {
	console.log("displayAllData");
	var store = getObjectStore(DB_STORE_NAME, 'readonly');
	
	var req ;
	req = store.count();
	
	req.onsuccess = function (evt){
		//alert("total data count:" + evt.target.result);
		console.log("total data count:" + evt.target.result);
	};
	
	var i=0;
	req = store.openCursor();
	
	var resultString = "";
	
	req.onsuccess = function(evt) {
		var cursor = evt.target.result;
		if (cursor) {
			console.log("displayDataList cursor:", cursor);
			req = store.get(cursor.key);
			req.onsuccess = function (evt) {
				var value = evt.target.result;
				resultString += value.id + "|" 
				+ value.gender + "|"
				+ value.locale + "|"
				+ value.username + "|"
				+ value.birthday + "|"
				+ value.work + "\n";
			};
			
			cursor.continue();
		} else {
			console.log(resultString);
		}
	};
}

  /**
   * @param {string} store_name
   * @param {string} mode either "readonly" or "readwrite"
   */
  function getObjectStore(store_name, mode) {
  	console.log("*** getObjectStore: " + store_name + "," + mode);
  	console.log(db);
    var tx = db.transaction(store_name, mode);
    return tx.objectStore(store_name);
  }
  
  function queryUserInfo(userName, store, success_callback) {
    var req = store.get(userName);
    req.onsuccess = function(evt) {
      var value = evt.target.result;
      if (value)
        success_callback(value.blob);
    };
  }

console.log("<< databaseHelper.js");