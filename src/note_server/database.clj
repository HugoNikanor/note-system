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
  (defn create-question-marks []
    (apply str
           (interpose ","
                      (repeat (count id)
                              "?"))))
  ; this solves the problem with a single comma
  ; TODO this should possibly be solved higher before query is called
  (if (zero? (count id))
    []
    ; TODO this could probably pe prettied up
    (sql/query database
               (into []
                     (cons
                       (str "select id, header, body, type
                            from note_test
                            where id in ("
                            (create-question-marks)
                            ")")
                       id)))))


; entry is a hashmap
(defn insert! [entry]
  (sql/insert! database :pass_test
               entry))

