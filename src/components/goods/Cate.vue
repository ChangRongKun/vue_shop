<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <!-- 添加区域 -->
        <el-col>
          <el-button type="primary"
                     @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <!-- data   表格各行的数据
           columns    表格各列的配置
           selection-type  是否为多选类型表格
           expand-type    是否为展开行类型表格
           show-index   是否显示数据索引
           index-text   数据索引名称
           border   是否显示纵向边框
           stripe   是否显示间隔斑马纹
           show-row-hover   鼠标悬停时，是否高亮当前行
       -->
      <tree-table class="treeTable"
                  :data="cateList"
                  :columns="columns"
                  :selection-type="false"
                  :expand-type="false"
                  show-index
                  index-text="#"
                  border
                  :show-row-hover="false">
        <!-- 是否有效 -->
        <template slot="isok"
                  slot-scope="scope">
          <i class="el-icon-success"
             v-if="scope.row.cat_deleted === false"
             style="color:green;"></i>
          <i class="el-icon-error"
             v-else
             style="color:red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order"
                  slot-scope="scope">
          <el-tag size="mini"
                  v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini"
                  type="success"
                  v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini"
                  type="warning"
                  v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <div style="width:160px">
            <el-button size="mini"
                       type="primary"
                       icon="el-icon-edit"
                       @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
            <el-button size="mini"
                       type="danger"
                       icon="el-icon-delete">删除</el-button>
          </div>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[3, 5, 10, 15]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类"
               :visible.sync="addCateDialogVisible"
               width="50%"
               @close="addCateDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addCateForm"
               ref="addCateFormRef"
               label-width="100px">
        <!-- 分类名称 -->
        <el-form-item label="分类名称："
                      prop="cat_name"
                      :rules="{
                        required:true,message:'请输入分类名称',trigger:'blur'
                      }">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <!-- 分类等级 -->
        <el-form-item label="父级分类：">
          <!--
            options   用来指定数据源
            props   用来指定配置对象
            clearable   是否支持清空选项
          -->
          <el-cascader v-model="selectedKeys"
                       :options="parentCateList"
                       :props="cascaderProps"
                       @change="parentCateChange"
                       clearable
                       >
          </el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类的对话框 -->
    <el-dialog title="编辑分类"
               :visible.sync="editCateDialogVisible"
               width="50%"
               @close="editCateDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editCateForm"
               ref="editCateFormRef"
               label-width="100px">
        <!-- 分类名称 -->
        <el-form-item label="分类名称："
                      prop="cat_name"
                      :rules="{
                        required:true,message:'请输入分类名称',trigger:'blur'
                      }">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表
      cateList: [],
      // 总条数
      total: 0,
      // 为 table 指定列的定义
      columns: [
        {
          // 列标题名称
          label: '分类名称',
          // 对应列内容的属性名
          prop: 'cat_name'
        }, {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'isok'
        }, {
          label: '排序',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'order'
        }, {
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 父级分类的id
        cat_pid: 0,
        // 将要添加的分类名称
        cat_name: '',
        // 分类的等级、默认添加一级分类
        cat_level: 0
      },
      // 父级分类的数据列表
      parentCateList: [],
      // 选中的父级分类的 ID 数组
      selectedKeys: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        // 指定选项标签为选项对象的某个属性值
        label: 'cat_name',
        // 指定选项的值为选项对象的某个属性值
        value: 'cat_id',
        // 指定选项的子选项为选项对象的某个属性值
        children: 'children',
        // 次级菜单的展开方式
        expandTrigger: 'hover',
        // 可以选择任意一项、父子节点可以不互相关联
        checkStrictly: true
      },
      // 控制编辑分类对话框的显示与隐藏
      editCateDialogVisible: false,
      // 修改分类的表单数据
      editCateForm: {}
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    /**
     * 获取商品分类信息
     */
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      // 把数据列表赋值给cateList
      this.cateList = res.data.result
      // 为总数居条数赋值
      this.total = res.data.total
    },
    /**
     * 监听 pagesize 改变
     */
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    /**
     * 监听 pagenum 改变
     */
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    /**
     * 点击按钮、展示添加分类的对话框
     */
    showAddCateDialog () {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再展示出对话框
      this.addCateDialogVisible = true
    },
    /**
     * 获取父级分类的数据列表
     */
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      this.parentCateList = res.data
    },
    /**
     * 选择项发生变化触发该函数
     */
    parentCateChange () {
      // 如果 selectedKeys 数组中的 length 大于0、证明选中了父级分类
      // 反之、就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的 ID
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 没有选中父级分类、重置父ID和等级
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    /**
     * 点击按钮、添加新的分类
     * 表单预校验以及提交
     */
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        // 进行表单的预校验
        if (!valid) return
        // 可以发起网络请求修改角色
        const { data: res } = await this.$http.post('categories', this.addCateForm)

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }

        this.addCateDialogVisible = false
        this.getCateList()
        this.$message.success('添加分类成功！')
      })
    },
    /**
     * 监听对话框的关闭事件、重置表单数据
     */
    addCateDialogClosed () {
      // 重置 form 表单
      this.$refs.addCateFormRef.resetFields()
      // 清空父级分类的 ID 数组
      this.selectedKeys = []
      // 重置分类的表单数据对象
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    /**
     * 点击按钮、展示编辑分类的对话框
     */
    async showEditCateDialog (id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类信息失败！')
      }
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    /**
     * 监听编辑对话框的关闭事件、重置表单数据
     */
    editCateDialogClosed () {
      this.$refs.editCateFormRef.resetFields()
    },
    /**
     * 修改分类
     */
    editCate () {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, {
          cat_name: this.editCateForm.cat_name
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类失败！')
        }
        this.$message.success('修改分类成功！')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    }
  },
  mounted () {
    /**
     * span上手动注册组件去调用radio的事件
     */
    setInterval(function () {
      document.querySelectorAll('.el-cascader-node__label').forEach(el => {
        el.onclick = function () {
          if (this.previousElementSibling) this.previousElementSibling.click()
        }
      })
    }, 1000)
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader{
  width:100%;
}
</style>
