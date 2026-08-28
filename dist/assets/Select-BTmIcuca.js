import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{lt as t,xt as n}from"./vendor-core-Dx1hYTS6.js";import{t as r}from"./motion-D_5aTixg.js";var i=e(n(),1),a=t(),o=({options:e,value:t,onChange:n,placeholder:o,className:s=``,...c})=>((0,i.useEffect)(()=>{let e=`select-open-glow`;if(!document.getElementById(e)){let t=document.createElement(`style`);t.id=e,t.textContent=`
        /* 🔥 GLOW ONLY WHEN DROPDOWN IS OPEN! */
        select:open {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
          outline: none !important;
        }
      `,document.head.appendChild(t)}},[]),(0,a.jsxs)(r,{as:`select`,value:t,onChange:e=>n(e.target.value),className:`
        px-2 py-1.5
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg
        text-sm text-gray-900 dark:text-gray-100
        truncate
        transition-colors duration-200 ease-out
        focus:outline-none
        ${s}
      `,...c,children:[o&&(0,a.jsx)(`option`,{value:``,disabled:!0,children:o}),e.map(e=>(0,a.jsx)(`option`,{value:e.value,children:e.label},e.value))]}));export{o as t};