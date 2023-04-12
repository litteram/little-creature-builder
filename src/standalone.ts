import { Ui } from "./ui.js"
import * as m from "mithril"

m.route(document.body, "/", {
  "/": Ui,
  "/:creature": Ui,
})
