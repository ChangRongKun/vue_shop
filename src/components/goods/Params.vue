<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部的警告区域 -->
      <el-alert title="注意：只允许为第三方分类设置相关参数！"
                type="warning"
                show-icon
                :closable="false">
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <!--
            options   用来指定数据源
            props   用来指定配置对象
            clearable   是否支持清空选项
          -->
          <el-cascader v-model="selectedCateKeys"
                       :options="cateList"
                       :props="cateProps"
                       @change="cateChange"
                       clearable>
          </el-cascader>
        </el-col>
      </el-row>

      <!-- Tab页签区域 -->
      <el-tabs v-model="activeName"
               @tab-click="handleTabClick">

        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数"
                     name="many">

          <!-- 添加参数的按钮 -->
          <el-button type="primary"
                     size="mini"
                     :disabled="isBtnDisable"
                     @click="addParamDialogVisible = true">添加参数</el-button>

          <!-- 动态参数表格 -->
          <el-table :data="manyTableData"
                    border
                    stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">

              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item,index) in scope.row.attr_vals"
                        :key="index"
                        closable
                        @close="handleClose(index,scope.row)">{{item}}</el-tag>

                <!-- 输入的文本框 -->
                <el-input class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="$event.target.blur"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else
                           class="button-new-tag"
                           size="small"
                           type="primary"
                           @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"
                             label="#"></el-table-column>
            <el-table-column label="参数名称"
                             prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary"
                           size="mini"
                           icon="el-icon-edit"
                           @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger"
                           size="mini"
                           icon="el-icon-delete"
                           @click="removeParamsByAttrId(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

        </el-tab-pane>

        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性"
                     name="only">

          <!-- 添加属性的按钮 -->
          <el-button type="primary"
                     size="mini"
                     :disabled="isBtnDisable"
                     @click="addParamDialogVisible = true">添加属性</el-button>

          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData"
                    border
                    stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">

              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item,index) in scope.row.attr_vals"
                        :key="index"
                        closable>{{item}}</el-tag>

                <!-- 输入的文本框 -->
                <el-input class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="$event.target.blur"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else
                           class="button-new-tag"
                           size="small"
                           type="primary"
                           @click="showInput(scope.row)">+ New Tag</el-button>
              </template>

            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"
                             label="#"></el-table-column>
            <el-table-column label="属性名称"
                             prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary"
                           size="mini"
                           icon="el-icon-edit"
                           @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger"
                           size="mini"
                           icon="el-icon-delete"
                           @click="removeParamsByAttrId(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

        </el-tab-pane>

      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog :title="'添加'+titleText"
               :visible.sync="addParamDialogVisible"
               width="50%"
               @close="addFormDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addParamForm"
               ref="addParamFormRef"
               label-width="100px">
        <!-- 添加参数 -->
        <el-form-item :label="titleText"
                      prop="attr_name"
                      :rules="{
                        required:true,message:'请输入参数名称',trigger:'blur'
                      }">
          <el-input v-model="addParamForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addParamDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog :title="'修改'+titleText"
               :visible.sync="editParamDialogVisible"
               width="50%"
               @close="editFormDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editParamForm"
               ref="editParamFormRef"
               label-width="100px">
        <!-- 添加参数 -->
        <el-form-item :label="titleText"
                      prop="attr_name"
                      :rules="{
                        required:true,message:'请输入参数名称',trigger:'blur'
                      }">
          <el-input v-model="editParamForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editParamDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editParams">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        // 次级菜单的展开方式
        expandTrigger: 'hover'
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // 被激活的页签名称
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addParamDialogVisible: false,
      // 添加参数的表单数据对象
      addParamForm: {
        attr_name: ''
      },
      // 控制修改对话框的显示与隐藏
      editParamDialogVisible: false,
      // 修改的表单数据对象
      editParamForm: {
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    /**
     * 获取所有的商品分类列表
     */
    async getCateList () {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }

      this.cateList = res.data
    },
    /**
     * 级联选择框选中项变化会触发的函数
     */
    cateChange () {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length < 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 证明选择了三级分类、
      this.getParamsData()
    },
    /**
     * Tab页签的点击事件对应的函数
     */
    handleTabClick () {
      this.cateChange()
    },
    /**
     * 根据所选分类的ID和当前所处的面板、获取对应的参数列表数据
     */
    async getParamsData () {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })

      if (res.meta.status !== 200) {
        return this.$message.error('获取分类参数列表失败！')
      }

      res.data.forEach(item => {
        // 值不为空才进行分割字符串、否则设置为空数组
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 添加布尔值、控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })

      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    /**
     * 监听添加对话框的关闭事件
     */
    addFormDialogClosed () {
      this.$refs.addParamFormRef.resetFields()
    },
    /**
     * 点击按钮、添加参数
     */
    addParams () {
      this.$refs.addParamFormRef.validate(async valid => {
        // 预校验
        if (!valid) return
        // 发送请求
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addParamForm.attr_name,
          attr_sel: this.activeName
        })

        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败！')
        }

        this.$message.success('添加参数成功！')
        this.addParamDialogVisible = false
        this.getParamsData()
      })
    },
    /**
     * 重置修改的表单
     */
    editFormDialogClosed () {
      this.$refs.editParamFormRef.resetFields()
    },
    /**
     * 点击按钮、展示修改的对话框
     */
    async showEditDialog (attrId) {
      // 查询当前参数的信息
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, { params: { attr_sel: this.activeName } })

      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败!')
      }

      this.editParamForm = res.data

      this.editParamDialogVisible = true
    },
    /**
     * 点击按钮、修改参数信息
     */
    editParams () {
      this.$refs.editParamFormRef.validate(async valid => {
        // 预校验
        if (!valid) return
        // 发送请求
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamForm.attr_id}`, {
          attr_name: this.editParamForm.attr_name,
          attr_sel: this.activeName
        })

        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        }

        this.$message.success('修改参数成功！')
        this.getParamsData()
        this.editParamDialogVisible = false
      })
    },
    /**
     * 根据Id删除对应的参数项
     */
    async removeParamsByAttrId (attrId) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 判断是否取消删除
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      // 发送删除请求
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)

      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败！')
      }

      this.getParamsData()
      this.$message.success('删除参数成功！')
    },
    /**
     * 文本框失去焦点、或按下enter键、都会触发
     */
    handleInputConfirm (row) {
      // 输入内容为空的处理
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 非空数据、需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    /**
     * 将对 attr_vals 的操作、保存到数据库
     */
    async saveAttrVals (row) {
      // 需要发起请求、保存这次操作
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }

      this.$message.success('修改参数项成功！')
    },
    /**
     * 点击按钮、展示文本输入框
     */
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick 方法的作用、就是当页面上的元素被重新渲染之后、才会执行回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    /**
     * 删除对应的参数和选项
     */
    handleClose (index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    /**
     * 定义一个计算属性、来判断按钮的禁用、启用状态
     * 如果按钮需要被禁用、则返回 true、否则返回 false
     */
    isBtnDisable () {
      if (this.selectedCateKeys.length < 3) {
        return true
      }
      return false
    },
    /**
     * 当前选中的三级分类ID
     * 返回值为 null 、证明不是三级分类
     */
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    /**
     * 动态计算弹出框标题的文本
     */
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0px;
}

.el-tag {
  margin: 10px;
}

.input-new-tag{
  width: 120px;
}
</style>
