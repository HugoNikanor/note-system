(ns password-manager.handler
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]
            [hiccup.core :refer :all]
            [hiccup.page :refer :all]
            [password-manager.database :as database]))

(declare create-entry)

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
           ; [s a] [service
           ;        account]
           (GET "/" [s a]
                (let [entries (database/db-get s a)]
                  (html [:table {:border "1"}
                         [:tr 
                          (map ;#([:td [:strong %]])
                               #(vector :td [:strong %])
                               table-fields)]
                         (map create-entry entries)])
                  )))
  (route/not-found "Not Found"))

; TODO defhtml
(defn create-entry [entry]
  (html
    [:tr
     (map #(vector :td ((keyword %) entry))
          table-fields)]))


(def app
  (wrap-defaults app-routes site-defaults))
