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
          <el-button type="primary" size="mini" :disabled="isBtnDisable">添加参数</el-button>

        </el-tab-pane>

        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性"
                     name="only">
          <!-- 添加属性的按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisable">添加属性</el-button>
        </el-tab-pane>

      </el-tabs>
    </el-card>
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
      onlyTableData: []
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
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
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
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0px;
}
</style>
