<template>
    <div>
   <!-- 面包屑区域 -->
    <el-breadcrumb
      separator-class="el-icon-arrow-right"
    >
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
        <el-alert
    title="添加商品的文案"
    type="info"
    center
    show-icon
    :closable="false">
  </el-alert>
  <!-- 步骤条 -->
  <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
  <el-step title="基本信息"></el-step>
  <el-step title="商品参数"></el-step>
  <el-step title="商品属性"></el-step>
  <el-step title="商品图片"></el-step>
  <el-step title="商品内容"></el-step>
  <el-step title="完成"></el-step>
</el-steps>

  <!-- tabs标签页 -->
  <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
  <el-tabs :tab-position="tabPosition"  v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click=tabClick>
    <el-tab-pane label="基本信息" name="0">
      <el-form-item label="商品名称" prop="goods_name">
    <el-input v-model="addForm.goods_name"></el-input>
  </el-form-item>
   <el-form-item label="商品价格" prop="goods_price">
    <el-input v-model="addForm.goods_price" type="number"></el-input>
  </el-form-item>
   <el-form-item label="商品重量" prop="goods_weight">
    <el-input v-model="addForm.goods_weight" type="number"></el-input>
  </el-form-item>
   <el-form-item label="商品数量" prop="goods_number">
    <el-input v-model="addForm.goods_number" type="number"></el-input>
  </el-form-item>
   <el-form-item label="商品分类" prop="goods_cat">
      <el-cascader expand-trigger="hover" :options="catelist" :props="cateProps" v-model="addForm.goods_cat" @change="handleChange"></el-cascader>
  </el-form-item>
    </el-tab-pane>
    <el-tab-pane label="商品参数" name="1">
      <!-- 渲染表单的item项 -->
      <el-form-item :label="item.attr_name" v-for="item in manyTableDate" :key="item.attr_id">
          <el-checkbox-group v-model="item.attr_vals">
    <el-checkbox :label="cd" v-for="(cd,i) in item.attr_vals" :key="i" border></el-checkbox>
  </el-checkbox-group>
      </el-form-item>
    </el-tab-pane>
    <el-tab-pane label="商品属性" name="2">
      <el-form-item :label="item.attr_name" v-for="item in onlyTableDate" :key="item.id">
        <el-input v-model="item.attr_vals"></el-input>
      </el-form-item>
    </el-tab-pane>
    <el-tab-pane label="商品图片" name="3">
      <!-- 图片上传 -->
      <!-- action 表示图片要上传到的后台API地址 -->
      <el-upload
       :action="uploadURL"
       :on-preview="handlePreview"
       :on-remove="handleRemove"
       list-type="picture"
       :headers="headersObj"
       :on-success="handleSuccess"
       >
  <el-button size="small" type="primary">点击上传</el-button>
</el-upload>
    </el-tab-pane>
     <el-tab-pane label="商品内容" name="4">
       <!-- 富文本编辑器组件 -->
         <quill-editor v-model="addForm.goods_introduce">
  </quill-editor>
      <!-- 添加商品的按钮 -->
      <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
     </el-tab-pane>
  </el-tabs>
  </el-form>
    </el-card>
      <!-- 图片预览 -->
    <el-dialog
  title="图片预览"
  :visible.sync="previewVisible"
  width="50%"
  >
  <img :src="previewPath" alt="" class="previewImg">
</el-dialog>
    </div>

</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0',
      tabPosition: 'left',
      // 添加商品的表单对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品详情
        goods_introduce: '',
        attr: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类的列表
      catelist: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 动态参数
      manyTableDate: [],
      // 静态参数
      onlyTableDate: [],
      // 上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件header请求头对象
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品数据失败!')
      }
      this.$message.success('获取商品数据成功')
      this.catelist = res.data
      console.log(this.catelist)
    },
    // 级联选择器选中就会触发这个函数
    handleChange() {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 触发这个函数阻止标签页的跳转
    beforeTabLeave(activeName, oldActiveName) {
      console.log('即将离开的标签页面' + oldActiveName)
      console.log('即将进入的标签页' + activeName)
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    async tabClick() {
      console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        console.log(res, 123)
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败!')
        }
        this.$message.success('获取动态参数参数列表成功')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? []
            : item.attr_vals.split(' ')
        })
        this.manyTableDate = res.data
        console.log(this.manyTableDate)
      } else
      if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        console.log(res, 1234)
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态参数失败!')
        }
        this.$message.success('获取静态成功')
        this.onlyTableDate = res.data
      }
    },
    // 处理图片预览效果
    handleRemove(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 处理移除图片的操作
    handlePreview(file) {
      console.log(file)
      // 1.查找 临时路径
      const filePath =
      file.response.data.tmp_path
      // 2.从pics数组中找到图片对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3.调用数组的splice方法,把图片信息对象,从pics数组中移除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 图片上传成功所触发的钩子
    handleSuccess(response) {
      // 1.拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      console.log(response)
      // 2.将图片信息对象 push到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    // 添加商品
    add() {
      // console.log(this.addForm)
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项!')
        }
        // 执行添加的业务逻辑
        // lodash
        // 先深拷贝一份
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableDate.forEach(item => {
          const newInfo = { attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ') }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableDate.forEach(item => {
          const newInfo = { att_id: item.attr_id,
            attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        // 发起请求添加商品
        // 商品的名称，必须是唯一的
        const { data: res } = await this.$http.post('goods', form)
        console.log(res, 88888)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败!')
        }
        this.$message.success('添加商品成功!')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else {
        return null
      }
    }
  }
}
</script>
<style scoped lang="less">
.el-checkbox{
  margin: 0 10px 0 0 !important;
}
.previewImg{
  width: 100%;
}
.btnAdd{
  margin-top: 15px;
}

</style>
