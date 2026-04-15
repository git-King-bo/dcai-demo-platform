import {
  ElButton,
  ElCollapse,
  ElCollapseItem,
  ElDialog,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElOption,
  ElSelect,
  ElSwitch,
  ElTag,
} from 'element-plus'
import { Clock, Delete, SwitchFilled } from '@element-plus/icons-vue'

const commonComponents = [
  ElButton,
  ElCollapse,
  ElCollapseItem,
  ElDialog,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElOption,
  ElSelect,
  ElSwitch,
  ElTag,
]

const commonIcons = [Clock, Delete, SwitchFilled]

export function registerElementPlusCommon(app) {
  commonComponents.forEach((component) => {
    app.component(component.name, component)
  })

  commonIcons.forEach((icon) => {
    app.component(icon.name, icon)
  })
}

export default {
  install(app) {
    registerElementPlusCommon(app)
  },
}
