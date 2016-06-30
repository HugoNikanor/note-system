(ns note-server.database
  (:require [clojure.java.jdbc :as sql])
  )

(def database {:subprotocol "mysql"
               :subname "//127.0.0.1:3306/clojure_test"
               :user "root"
               :password ""})


(defn query 
  "Returs a JSON list with objects, as a string"
  [id]
  (sql/query database
             (into [] 
                   (cons 
                     (str "select id, header, body, type
                          from note_test 
                          where id in ("
                          (apply str 
                                 (interpose "," 
                                            (repeat (count id)
                                                    "?")))
                          ")")
                     id))))


; entry is a hashmap
(defn insert! [entry]
  (sql/insert! database :pass_test
               entry))

