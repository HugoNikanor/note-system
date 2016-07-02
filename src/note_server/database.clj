(ns note-server.database
  (:require [clojure.java.jdbc :as sql])
  )

(def database {:subprotocol "mysql"
               :subname "//127.0.0.1:3306/clojure_test"
               :user "root"
               :password ""})

(defn query-all
  "Returs a hashmap list"
  [& [options]]
  (sql/query database
             ["SELECT id, header, body, type
              FROM note_test"
              ;ORDER BY id DESC
              ]))

(defn query
  "Returs a hashmap list"
  [ids]
  (defn create-question-marks [no]
    (apply str
           (interpose ","
                      (repeat no "?"))))
  ; this solves the problem with a single comma
  ; TODO this should possibly be solved higher before query is called
  (let [no (count ids)]
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
                         ids))))))


; entry is a hashmap
(defn insert! [entry]
  (println (str "┃" entry))
  ; This returns ({:generated_key [id]})
  (sql/insert! database :note_test
               entry))

