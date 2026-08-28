import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{lt as t,xt as n}from"./vendor-core-Dx1hYTS6.js";import{t as r}from"./motion-D_5aTixg.js";import{i,n as a,o}from"./Container-B-zHceXI.js";var s=e(n(),1),c=(...e)=>e.filter(Boolean).join(` `),l={wrapper:`flex flex-col gap-1.5 w-full`,container:(e,t)=>c(`flex items-center gap-2 rounded-xl border bg-white dark:bg-gray-800 px-3 py-2.5`,`transition-all duration-200 ease-out`,`focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20`,`hover:border-gray-400 dark:hover:border-gray-500`,e?`border-red-400 focus-within:border-red-500 focus-within:ring-red-500/20`:`border-gray-300 dark:border-gray-600`,t),field:e=>c(`w-full bg-transparent outline-none text-base text-gray-900 dark:text-white`,`placeholder:text-gray-400 dark:placeholder:text-gray-500`,`disabled:cursor-not-allowed disabled:text-gray-400 dark:disabled:text-gray-500`,`min-w-0`,`selection:bg-blue-500/30 dark:selection:bg-blue-400/30`,e)},u=t(),d=(0,s.forwardRef)(({className:e=``,label:t,error:n,prefix:r,suffix:i,fullWidth:a=!0,id:o,disabled:s=!1,required:c=!1,type:d=`text`,onDoubleClick:f,...p},m)=>{let h=o||`input-${Math.random().toString(36).slice(2,9)}`;return(0,u.jsxs)(`div`,{className:`${l.wrapper} ${a?`w-full`:``}`,children:[t&&(0,u.jsxs)(`label`,{htmlFor:h,className:`text-sm font-medium text-gray-700 dark:text-gray-300`,children:[t,c&&(0,u.jsx)(`span`,{className:`ml-0.5 text-red-500`,children:`*`})]}),(0,u.jsxs)(`div`,{className:l.container(!!n,e),children:[r&&(0,u.jsx)(`span`,{className:`flex-shrink-0 text-gray-500 dark:text-gray-400 text-sm`,children:r}),(0,u.jsx)(`input`,{ref:m,id:h,type:d,disabled:s,required:c,className:l.field(),onDoubleClick:e=>{e.currentTarget.select(),f&&f(e)},...p}),i&&(0,u.jsx)(`span`,{className:`flex-shrink-0 text-gray-500 dark:text-gray-400 text-sm`,children:i})]}),n&&(0,u.jsxs)(`p`,{className:`text-sm text-red-500 dark:text-red-400 flex items-center gap-1`,children:[(0,u.jsx)(`span`,{className:`text-xs`,children:`⚠️`}),n]})]})});d.displayName=`Input`;var f=()=>({className:`${o()} ${i()} ${a()}`}),p=({children:e,variant:t=`primary`,className:n=``,onClick:i,disabled:a=!1,type:o=`button`,...s})=>(0,u.jsx)(r,{preset:f,as:`button`,type:o,onClick:i,disabled:a,className:`
        inline-flex items-center justify-center
        px-6 py-2.5
        text-sm font-medium
        rounded-lg
        select-none
        cursor-pointer
        disabled:opacity-50 disabled:pointer-events-none
        ${{primary:`
      bg-blue-600 hover:bg-blue-700 
      dark:bg-blue-700 dark:hover:bg-blue-600
      text-white
      shadow-sm hover:shadow-md
    `,secondary:`
      bg-gray-100 hover:bg-gray-200 
      dark:bg-gray-800 dark:hover:bg-gray-700
      text-gray-800 dark:text-gray-200
      hover:shadow-sm
    `,ghost:`
      bg-transparent hover:bg-gray-100 
      dark:hover:bg-gray-800
      text-gray-700 dark:text-gray-300
    `,danger:`
      bg-red-600 hover:bg-red-700 
      dark:bg-red-700 dark:hover:bg-red-600
      text-white
      shadow-sm hover:shadow-md
    `}[t]}
        ${n}
      `,...s,children:e});export{f as n,d as r,p as t};