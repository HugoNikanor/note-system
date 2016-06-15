(ns password-manager.database
  (:require [clojure.java.jdbc :as sql])
  )

(def database {:subprotocol "mysql"
               :subname "//127.0.0.1:3306/clojure_test"
               :user "root"
               :password ""})


; returns a hashmap
(defn query [service username email show-old]
  (sql/query database
           [(str "select service, username, email, note, date_set, password
                 from pass_test 
                 where service like ?
                 and username like ?
                 and email like ?"
                 (if (not show-old) "and replaced = false"))
            (if service (str "%" service "%") "%")
            (if username (str "%" username "%") "%")
            (if email (str "%" email "%") "%")]))

; entry is a hashmap
(defn insert! [entry]
  (sql/insert! database :pass_test
               entry))

