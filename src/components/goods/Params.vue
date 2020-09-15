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
            <el-table-column type="expand"></el-table-column>
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
                           icon="el-icon-delete">删除</el-button>
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
            <el-table-column type="expand"></el-table-column>
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
                           icon="el-icon-delete">删除</el-button>
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
</style>
