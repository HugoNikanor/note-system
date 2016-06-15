(ns password-manager.handler
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]
            [hiccup.core :refer :all]
            [hiccup.page :refer :all]
            [password-manager.database :as db]))

(declare create-entry)
(declare create-entries-table)

(def table-fields (map str ['service
                            'username
                            'email
                            'password
                            'date-set
                            'note]))

(defroutes app-routes
  (GET "/" [] "Hello World")
  (route/resources "/")
  (context "/password" []
           (GET "/" [service username email show-old]
                (let [entries (db/query service username email show-old)]
                  (create-entries-table entries)
                  )))
  (route/not-found "Not Found"))

(defn create-entries-table [entries]
  (html [:table {:border "1"}
         [:tr 
          (map ;#([:td [:strong %]])
               #(vector :td [:strong %])
               table-fields)]
         (map create-entry entries)]))

; TODO defhtml
(defn create-entry [entry]
  (html
    [:tr
     (map #(vector :td ((keyword %) entry))
          table-fields)]))


(def app
  (wrap-defaults app-routes site-defaults))
