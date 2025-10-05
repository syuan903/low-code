import { createRouter, createWebHistory } from 'vue-router'
import { useMetarialStore } from '@/stores/useMetarial'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/editor/:id(\\d+)?',
      name: 'editor',
      component: () => import('@/views/EditorView/Index.vue'),
      children: [
        {
          path:'survey-type',
          name:'survey-type',
          component: () => import('@/views/EditorView/LeftSide/SurveyType.vue')
        },
        {
          path:'outline',
          name:'outline',
          component: () => import('@/views/EditorView/LeftSide/Outline.vue')
        },
      ]
    },
    {
      path: '/materials',
      name: 'materials',
      component: () => import('@/views/MaterialsViews/index.vue'),
      redirect: '/select-group',
      children: [
        {
          path: '/select-group',
          name: 'select-group',
          component: () => import('@/views/MaterialsViews/SelectGroupView.vue'),
          redirect: '/single-select',
          children: [
            {
              path: '/single-select',
              name: 'single-select',
              component: () =>
                import('@/components/SurveyComs/MaterialsComs/SelectComs/SingleSelect.vue'),
            },
            {
              path: '/multi-select',
              name: 'multi-select',
              component: () =>
                import('@/components/SurveyComs/MaterialsComs/SelectComs/MultiSelect.vue'),
            },
            {
              path: '/single-pic-select',
              name: 'single-pic-select',
              component: () =>
                import('@/components/SurveyComs/MaterialsComs/SelectComs/SinglePicSelect.vue'),
            },
            {
              path: '/multi-pic-select',
              name: 'multi-pic-select',
              component: () =>
                import('@/components/SurveyComs/MaterialsComs/SelectComs/MultiPicSelect.vue'),
            },
            {
              path: '/option-select',
              name: 'option-select',
              component: () =>
                import('@/components/SurveyComs/MaterialsComs/SelectComs/OptionalSelect.vue'),
            },
          ],
        },
        {
          path: '/input-group',
          name: 'input-group',
          component: () => import('@/views/MaterialsViews/InputGroupView.vue'),
          redirect: '/text-input',
          children: [
            {
              path: '/text-input',
              name: 'text-input',
              component: () =>
                import('@/components/SurveyComs/MaterialsComs/InputComs/TextInput.vue'),
            }
          ]
        },
        {
          path: '/advanced-group',
          name: 'advanced-group',
          component: () => import('@/views/MaterialsViews/AdvancedGroupView.vue'),
          redirect: '/rate-score',
          children:[
            {
              path: '/rate-score',
              name: 'rate-score',
              component: () =>
                import('@/components/SurveyComs/MaterialsComs/AdvancedComs/RateScore.vue'),
            },
            {
              path: '/date-time',
              name: 'date-time',
              component: () =>
                import('@/components/SurveyComs/MaterialsComs/AdvancedComs/DateTime.vue'),
            }
          ]
        },
        {
          path: '/note-group',
          name: 'note-group',
          component: () => import('@/views/MaterialsViews/NoteGroupView.vue'),
          redirect: '/text-note',
          children: [
            {
              path: '/text-note',
              name: 'text-note',
              component: () =>
                import('@/components/SurveyComs/MaterialsComs/NoteComs/TextNote.vue'),
            },
          ],
        },
        {
          path: '/personal-info-group',
          name: 'personal-info-group',
          component: () => import('@/views/MaterialsViews/PersonalInfoGroupView.vue'),
          redirect: '/personal-info-name',
          children: [
            {
              path: '/personal-info-name',
              name: 'personal-info-name',
              component: () => import('@/components/SurveyComs/MaterialsComs/InputComs/TextInput.vue'),
            },
            {
              path: '/personal-info-id',
              name: 'personal-info-id',
              component: () => import('@/components/SurveyComs/MaterialsComs/InputComs/TextInput.vue'),
            },
            {
              path: '/personal-info-birth',
              name: 'personal-info-birth',
              component: () =>
                import('@/components/SurveyComs/MaterialsComs/AdvancedComs/DateTime.vue'),
            },
            {
              path: '/personal-info-gender',
              name: 'personal-info-gender',
              component: () =>
                import('@/components/SurveyComs/MaterialsComs/SelectComs/SingleSelect.vue'),
            },
            {
              path: '/personal-info-age',
              name: 'personal-info-age',
              component: () =>
                import('@/components/SurveyComs/MaterialsComs/SelectComs/SingleSelect.vue'),
            },
            {
              path: '/personal-info-education',
              name: 'personal-info-education',
              component: () =>
                import('@/components/SurveyComs/MaterialsComs/SelectComs/SingleSelect.vue'),
            },
            {
              path: '/personal-info-collage',
              name: 'personal-info-collage',
              component: () => import('@/components/SurveyComs/MaterialsComs/InputComs/TextInput.vue'),
            },
            {
              path: '/personal-info-major',
              name: 'personal-info-major',
              component: () => import('@/components/SurveyComs/MaterialsComs/InputComs/TextInput.vue'),
            },
            {
              path: '/personal-info-industry',
              name: 'personal-info-industry',
              component: () => import('@/components/SurveyComs/MaterialsComs/InputComs/TextInput.vue'),
            },
            {
              path: '/personal-info-career',
              name: 'personal-info-career',
              component: () =>
                import('@/components/SurveyComs/MaterialsComs/SelectComs/SingleSelect.vue'),
            },
            {
              path: '/personal-info-company',
              name: 'personal-info-company',
              component: () => import('@/components/SurveyComs/MaterialsComs/InputComs/TextInput.vue'),
            },
            {
              path: '/personal-info-position',
              name: 'personal-info-position',
              component: () => import('@/components/SurveyComs/MaterialsComs/InputComs/TextInput.vue'),
            },
          ],
        },
        {
          path: '/contact-group',
          name: 'contact-group',
          component: () => import('@/views/MaterialsViews/ContactGroupView.vue'),
          redirect: '/personal-info-tel',
          children:[
           {
              path: '/personal-info-tel',
              name: 'personal-info-tel',
              component: () => import('@/components/SurveyComs/MaterialsComs/InputComs/TextInput.vue'),
            },
            {
              path: '/personal-info-wechat',
              name: 'personal-info-wechat',
              component: () => import('@/components/SurveyComs/MaterialsComs/InputComs/TextInput.vue'),
            },
            {
              path: '/personal-info-qq',
              name: 'personal-info-qq',
              component: () => import('@/components/SurveyComs/MaterialsComs/InputComs/TextInput.vue'),
            },
            {
              path: '/personal-info-email',
              name: 'personal-info-email',
              component: () => import('@/components/SurveyComs/MaterialsComs/InputComs/TextInput.vue'),
            },
            {
              path: '/personal-info-address',
              name: 'personal-info-address',
              component: () => import('@/components/SurveyComs/MaterialsComs/InputComs/TextInput.vue'),
            },
          ]
        },
      ],
    },
    {
      path: '/preview/:id(\\d+)',
      name: 'preview',
      component: () => import('@/views/PreView.vue'),
    },
    {
      path: '/quiz/:id',
      name: 'quiz',
      component: () => import('@/views/QuizView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const activeView = localStorage.getItem('activeView') || 'home'
  if (activeView === 'materials' && to.name) {
    const store = useMetarialStore()
    store.setCurrentMaterialCom(to.name as string)
  }
})

export default router
