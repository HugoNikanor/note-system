(ns note-server.database
  (:require [clojure.java.jdbc :as sql])
  )

(def database {:subprotocol "mysql"
               :subname "//127.0.0.1:3306/clojure_test"
               :user "root"
               :password ""})


; returns a hashmap
(defn query [id]
  ; TODO support any number of arguments
  (sql/query database
             [(str "select id, header, body
                   from note_test 
                   where id in (?,?)")
              (first id)
              (first (rest id))]))


; entry is a hashmap
(defn insert! [entry]
  (sql/insert! database :pass_test
               entry))

