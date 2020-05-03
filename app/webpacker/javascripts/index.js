import Rails from "@rails/ujs"
Rails.start()

import * as ActiveStorage from "@rails/activestorage"
ActiveStorage.start()

import Turbolinks from "turbolinks"
Turbolinks.start()

import './channels'
