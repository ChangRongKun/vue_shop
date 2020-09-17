<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部的警告区域 -->
      <el-alert title="添加商品信息"
                type="info"
                show-icon
                center
                :closable="false">
      </el-alert>

      <!-- 步骤条区域 -->
      <el-steps :space="200"
                :active="activeIndex-0"
                align-center
                finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form :model="addForm"
               :rules="addFormRules"
               ref="addFormRef"
               label-width="100px"
               label-position="top">
        <!-- tab栏区域 -->
        <el-tabs v-model="activeIndex"
                 :tab-position="'left'"
                 :before-leave="beforeTabLeave"
                 @tab-click="tabClicked">

          <!-- 基本信息        -->
          <el-tab-pane label="基本信息"
                       name="0">
            <el-form-item label="商品名称"
                          prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格"
                          prop="goods_price">
              <el-input v-model.number="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品数量"
                          prop="goods_number">
              <el-input v-model.number="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量"
                          prop="goods_weight">
              <el-input v-model.number="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品分类"
                          prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat"
                           :options="cateList"
                           :props="cateProps"
                           @change="cateHandleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <!-- 商品参数 -->
          <el-tab-pane label="商品参数"
                       name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item :label="item.attr_name"
                          v-for=" item in manyTableData"
                          :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="val"
                             v-for="(val,i) in item.attr_vals"
                             :key="i"
                             border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <!-- 商品属性 -->
          <el-tab-pane label="商品属性"
                       name="2">
            <el-form-item :label="item.attr_name"
                          v-for="item in onlyTableData"
                          :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <!-- 商品图片 -->
          <el-tab-pane label="商品图片"
                       name="3">
            <!--
              action   表示图片要上传到的后台的API地址
              on-preview    点击文件列表中已上传的文件时的钩子
              on-remove  文件列表移除文件时的钩子
              list-type  文件列表的类型
              headers    设置上传的请求头部
              on-success  文件上传成功时的钩子
            -->
            <el-upload :action="uploadURL"
                       :on-preview="handlePreview"
                       :on-remove="handleRemove"
                       list-type="picture"
                       :headers="headerObj"
                       :on-success="handleSuccess">
              <el-button size="small"
                         type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>

          <!-- 商品内容 -->
          <el-tab-pane label="商品内容"
                       name="4">商品内容</el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览"
               :visible.sync="previewVisible"
               width="50%">
      <img :src="previewPath"
           alt="预览的图片"
           class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        // 商品名称
        goods_name: '',
        // 商品价格
        goods_price: 0,
        // 商品数量
        goods_number: 0,
        // 商品重量
        goods_weight: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: []
      },
      // 添加商品表单的验证规则
      addFormRules: {
        // 商品名称的校验规则
        goods_name: [
          { required: true, message: '请输入商品名称', triggger: 'blur' }
        ],
        // 商品价格的校验规则
        goods_price: [
          { type: 'number', required: true, message: '请输入商品价格', triggger: 'blur' }
        ],
        // 商品数量的校验规则
        goods_number: [
          { type: 'number', required: true, message: '请输入商品数量', triggger: 'blur' }
        ],
        // 商品重量的校验规则
        goods_weight: [
          { type: 'number', required: true, message: '请输入商品重量', triggger: 'blur' }
        ],
        // 商品所属分类的校验规则
        goods_cat: [
          { type: 'array', required: true, message: '请选择商品分类', triggger: 'change' }
        ]
      },
      // 获取的商品分类数据
      cateList: [],
      // 级联选择器的配置信息
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 获取的动态参数列表数据
      manyTableData: [],
      // 获取的静态属性列表数据
      onlyTableData: [],
      // 上传图片的 URL 地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload/',
      // 图片上传组件的 headers 请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 要预览图片的路径
      previewPath: '',
      // 控制预览图片的弹出框的显示与隐藏
      previewVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    /**
     * 获取所有的商品分类数据
     */
    async getCateList () {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }

      this.cateList = res.data
    },
    /**
   * 商品分类级联选择器选中项发生变化、会触发的函数
   */
    cateHandleChange () {
      // 不是第三级分类的话、清空数据
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    /**
     * 阻止标签页的切换
     */
    beforeTabLeave (activeName, oldActiveName) {
      // console.log('即将离开的标签页是：' + oldActiveName)
      // console.log('即将进入的标签页是：' + activeName)
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    /**
     * 切换tab标签触发的事件
     *
     * activeIndex 为 1 、证明访问的是商品参数面板
     *
     * activeIndex 为 2 、证明访问的是商品属性面板
     */
    async tabClicked () {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many'
          }
        })

        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败！')
        }

        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? 0 : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only'
          }
        })

        if (res.meta.status !== 200) {
          return this.$message.error('获取商品属性失败！')
        }

        this.onlyTableData = res.data
      }
    },
    /**
     * 处理图片的预览效果
     */
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    /**
     * 处理移除图片的触发事件
     */
    handleRemove (file) {
      // 1、获取要移除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2、从 pics 数组中、找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(x =>
        x.pic === filePath
      )
      // 3、调用数组中的 splice 方法、把图片信息对象、从 pics 数组中移除
      this.addForm.pics.splice(i, 1)
    },
    /**
     * 处理上传图片成功的触发事件
     */
    handleSuccess (response) {
      // 1、拼接得到一个图片信息对象
      const picInfo = {
        pic: response.data.tmp_path
      }
      // 2、将图片信息对象、push到pics数组中
      this.addForm.pics.push(picInfo)
    }
  },
  computed: {
    /**
     * 通过计算属性、获取商品的三级分类ID
     */
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}
</style>
