import"./rolldown-runtime-Dd_uD5pT.js";import{lt as e,xt as t}from"./vendor-core-Dx1hYTS6.js";import{t as n}from"./motion-D_5aTixg.js";import{t as r}from"./iconButtonMotion-BsILaK0e.js";t();var i=e(),a={xs:`w-6 h-6 text-xs`,sm:`w-8 h-8 text-sm`,md:`w-10 h-10 text-base`,lg:`w-12 h-12 text-lg`},o={xs:`w-3 h-3`,sm:`w-4 h-4`,md:`w-5 h-5`,lg:`w-6 h-6`},s=({onClick:e,children:t,variant:s=`standard`,size:c=`md`,disabled:l=!1,className:u=``,ariaLabel:d})=>{let f={standard:`
      bg-transparent
      text-gray-600 dark:text-gray-300
      hover:text-blue-600 dark:hover:text-blue-400
      hover:bg-gray-100/50 dark:hover:bg-gray-800/50
      disabled:text-gray-400 dark:disabled:text-gray-500
    `,filled:`
      bg-blue-600 dark:bg-blue-700
      text-white
      hover:bg-blue-700 dark:hover:bg-blue-600
      disabled:bg-gray-300 dark:disabled:bg-gray-600
      disabled:text-gray-400 dark:disabled:text-gray-400
    `,tonal:`
      bg-blue-50 dark:bg-blue-950/50
      text-blue-600 dark:text-blue-300
      hover:text-blue-700 dark:hover:text-blue-200
      hover:bg-blue-100 dark:hover:bg-blue-900/50
      disabled:bg-gray-100 dark:disabled:bg-gray-800
      disabled:text-gray-400 dark:disabled:text-gray-500
    `,outlined:`
      bg-transparent
      border border-gray-300 dark:border-gray-600
      text-gray-600 dark:text-gray-300
      hover:text-blue-600 dark:hover:text-blue-400
      hover:border-blue-500 dark:hover:border-blue-400
      hover:bg-gray-50/50 dark:hover:bg-gray-800/50
      disabled:border-gray-200 dark:disabled:border-gray-700
      disabled:text-gray-400 dark:disabled:text-gray-500
    `},p=a[c],m=o[c];return(0,i.jsx)(n,{preset:r,as:`button`,type:`button`,onClick:e,disabled:l,"aria-label":d,className:`
        inline-flex items-center justify-center
        rounded-full
        select-none
        cursor-pointer
        focus:outline-none
        disabled:opacity-50 disabled:pointer-events-none
        ${f[s]}
        ${p}
        ${u}
      `,children:(0,i.jsx)(`span`,{className:m,children:t})})};export{s as t};