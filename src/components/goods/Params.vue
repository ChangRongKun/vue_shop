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
                       clearable
                       >
          </el-cascader>
        </el-col>
      </el-row>
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
      selectedCateKeys: []
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
      // 证明选中的是三级分类
      console.log(this.selectedCateKeys)
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0px;
}
</style>
