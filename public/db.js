// from homework 23 assets/js/topic.js

import { useIndexedDb } from "./indexedDb";
import { loadArticles } from "./API";
import { renderArticles } from "./domMethods";
// Call renderArticles on page load
function loadPage() {
  useIndexedDb("articles", "ArticleStore", "get").then(results => {
    const favorites = results;
    loadArticles().then(data => {
      const mappedData = data.map(article => {
        article.favorite = false;
        favorites.forEach(fav => {
          if (article._id === fav._id) {
            article.favorite = true;
          }
        });
        return article;
      });
      renderArticles(mappedData, loadPage);
    });
  });
}

loadPage();

// from homework 23 assets/js/favorites.js

import { checkForIndexedDb, useIndexedDb } from "./indexedDb";
import { renderArticles } from "./domMethods";

function loadPage() {
  if (checkForIndexedDb()) {
    useIndexedDb("articles", "ArticleStore", "get").then(results => {
      results.forEach(favorite => {
        favorite.favorite = true;
      });
      renderArticles(results, loadPage);
    });
  }
}

loadPage();


// from homework 23 assets/js/indexedDB.js

export function checkForIndexedDb() {
    if (!window.indexedDB) {
      console.log("Your browser doesn't support a stable version of IndexedDB.");
      return false;
    }
    return true;
  }
  
  export function useIndexedDb(databaseName, storeName, method, object) {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(databaseName, 1);
      let db,
        tx,
        store;
  
      request.onupgradeneeded = function(e) {
        const db = request.result;
        db.createObjectStore(storeName, { keyPath: "_id" });
      };
  
      request.onerror = function(e) {
        console.log("There was an error");
      };
  
      request.onsuccess = function(e) {
        db = request.result;
        tx = db.transaction(storeName, "readwrite");
        store = tx.objectStore(storeName);
  
        db.onerror = function(e) {
          console.log("error");
        };
        if (method === "put") {
          store.put(object);
        } else if (method === "get") {
          const all = store.getAll();
          all.onsuccess = function() {
            resolve(all.result);
          };
        } else if (method === "delete") {
          store.delete(object._id);
        }
        tx.oncomplete = function() {
          db.close();
        };
      };
    });
  }
  