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
  (defn create-question-marks [no]
    (apply str
           (interpose ","
                      (repeat no "?"))))
  ; this solves the problem with a single comma
  ; TODO this should possibly be solved higher before query is called
  (let [no (count id)]
    (if (zero? no)
      []
      ; TODO this could probably be prettied up
      (sql/query database
                 (into []
                       (cons
                         (str "select id, header, body, type
                              from note_test
                              where id in ("
                              (create-question-marks no)
                              ")")
                         id))))))


; entry is a hashmap
(defn insert! [entry]
  (println (str "┃" entry))
  ; This returns ({:generated_key [id]})
  (sql/insert! database :note_test
               entry))

