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
        <el-table-column type="expand">
          <!-- 通过作用域插槽进行处理 -->
          <template slot-scope="scope">
            <!-- 第一层循环、拿到的是一级权限 -->
            <el-row
                v-for="(item1,i1) in scope.row.children"
                :key="item1.id"
                :class="['bdbottom',i1 === 0?'bdtop':'']">
              <!-- 循环渲染一级权限 -->
              <el-col :span="5">
                <el-tag>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 第二层循环、拿到的是二级权限 -->
                <el-row
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                  :class="i2 ===0?'':'bdtop'">
                  <!-- 通过for循环嵌套渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>

                  <!-- 剩下的部分是第三级权限 -->
                  <el-col :span="18">
                    <!-- 循环标签、展示三级权限 -->
                    <el-tag
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      type="warning">{{item3.authName}}</el-tag>
                  </el-col>
                  </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
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
            <el-button size="mini"
                       type="danger"
                       icon="el-icon-delete"
                       @click="removeRoleById(scope.row.id)">删除</el-button>
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
    },
    /**
     * 根据ID删除角色
     */
    async removeRoleById (id) {
      // 弹出询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认删除、则返回值是字符串、confirm
      // 如果用户取消删除、则返回值是字符串、cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete('/roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      }
      this.$message.success('删除角色成功！')
      this.getRolesList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag{
  margin: 7px;
}

.bdtop{
  border-top: 1px solid #eee;
}

.bdbottom{
  border-bottom: 1px solid #eee;
}
</style>
