<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand"></el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope" >
            <el-button size="mini"
                       type="primary"
                       icon="el-icon-edit"
                       @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色"
               :visible.sync="addDialogVisible"
               width="35%"
               @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm"
               ref="addFormRef"
               label-width="90px">
        <!-- 用户名 -->
        <el-form-item label="角色名称"
                      prop="roleName"
                      :rules="{
                        required:true,message:'请输入角色名称',trigger:'blur'
                      }">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="角色描述">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色的对话框 -->
    <el-dialog title="修改角色"
               :visible.sync="editDialogVisible"
               width="35%"
               @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editForm"
               ref="editFormRef"
               label-width="90px">
        <!-- 用户名 -->
        <el-form-item label="角色名称"
                      prop="roleName"
                      :rules="{
                        required:true,message:'请输入角色名称',trigger:'blur'
                      }">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="角色描述">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 控制添加角色的对话框的展示和隐藏
      addDialogVisible: false,
      // 添加角色的表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 控制修改角色的对话框的展示和隐藏
      editDialogVisible: false,
      // 修改角色的表单数据
      editForm: {}
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    /**
     * 获取所有角色列表
     */
    async getRolesList () {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
    },
    /**
     * 监听添加角色对话框的关闭事件
     */
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    /**
     * 添加角色
     */
    addRole () {
      this.$refs.addFormRef.validate(async valid => {
        // 进行表单的预校验
        if (!valid) return
        // 可以发送添加角色的网络请求
        const { data: res } = await this.$http.post('/roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('角色创建失败！')
        }
        this.$message.success('角色创建成功！')
        // 隐藏添加角色的弹出框
        this.addDialogVisible = false
        // 重新获取角色列表数据
        this.getRolesList()
      })
    },
    /**
     * 展示修改角色的弹出框
     */
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`/roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    /**
     * 修改表单关闭后的重置操作
     */
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    /**
     * 表单预校验以及提交
     */
    editRoleInfo () {
      this.$refs.editFormRef.validate(async valid => {
        // 进行表单的预校验
        if (!valid) return
        // 可以发起网络请求修改角色
        const { data: res } = await this.$http.put('/roles/' + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色失败！')
        }
        this.editDialogVisible = false
        this.getRolesList()
        this.$message.success('更新角色成功！')
      })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
