(ns noteServer.database
  (:require [clojure.java.jdbc :as sql])
  )

(def database {:subprotocol "mysql"
               :subname "//127.0.0.1:3306/note_server"
               :user "root"
               :password ""})

(defn query-modules
  "Returns a hashmap/vector of all modules and
   module bodies for the note with id 'note-id'"
  [note-id]

  ;; These three functions should probably be simplified down into one function
  (defn query-text
    "Returns the text for a header or text module"
    [module-id note-id]
    (sql/query database
               ["SELECT id, text FROM text_and_header_modules
                 WHERE module_id LIKE ?
                 AND note_id LIKE ?"
                 module-id note-id]))
  (defn query-list [module-id note-id]
    "Returns the list of bullets for a list module"
    (sql/query database
               ["SELECT id, text, done FROM list_items
                 WHERE module_id LIKE ?
                 AND note_id LIKE ?"
                 module-id note-id]))
  (defn query-image [module-id note-id]
    "Returns the image, with metadata, for image modules"
    (sql/query database
               ["SELECT id, image_src, title_text FROM image_modules
                 WHERE module_id LIKE ?
                 AND note_id LIKE ?"
                 module-id note-id]))

  ;; get's all the data for the modules
  (map #(let [id (:id %)
              type (:type %)]
          (assoc %
                 :data (case type
                         "header" (first (query-text id note-id))
                         "text"   (first (query-text id note-id))
                         "image"  (first (query-image id note-id))
                         "list"   (query-list id note-id))))
       ;; Get's the modules
       (sql/query database
                  ["SELECT id, type FROM modules WHERE note_id LIKE ?"
                   note-id])))


(defn query-notes 
  "Returns a list of completed notes, as a hashmap.
   The input arguments should be a list of the desired notes,
   or empty for ALL notes"
  [& notes]

  (defn complete-note
    "Takes a hashmap with a note id, and returns a hashmap with the complete note"
    [hash-map]
    (assoc hash-map
           :modules (query-modules (:id hash-map))))

  (let [q-mark-create (fn [no] (apply str (interpose "," (repeat no "?"))))
        no (count notes)
        clause (cond
                 (= no 0) ""
                 (= no 1) "WHERE id LIKE ?"
                 :else (str "WHERE id IN (" (q-mark-create no) ")"))
        query (str "SELECT id FROM notes" " " clause)]
    (map complete-note
         (sql/query database (into [] (cons query notes))))))


; TODO maybe this function should be typed...
; new value should be given as an int, with 1 for true and 0 for false
(defn change-checkbox! [note-id module-id item-id new-value]
  (sql/update! database :list_items
               {:done new-value}
               ["note_id  = ? and
                module_id = ? and
                id        = ?"
                note-id module-id item-id]))

(defn insert-list-item! [note-id module-id text]
  (sql/insert! database :list_items
               {:note_id note-id
                :module_id module-id
                :text text}))

;;; Stuff that probably doesn't work since the introduction of modules

(defn update-note! [id header body]
  (sql/update! database :note_test
               (merge {}
                      (if header
                        {:header header})
                      (if body
                        {:body body}))
               ["id = ?"
                id]))

; entry is a hashmap
(defn insert! [entry]
  (println (str "┃" entry))
  ; This returns ({:generated_key [id]})
  (sql/insert! database :note_test
               entry))

