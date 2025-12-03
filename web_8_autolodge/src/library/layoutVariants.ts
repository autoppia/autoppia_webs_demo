export interface LayoutConfig {
  searchBar: {
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    containerClass: string;
    wrapperClass: string;
    fieldClass: string;
    buttonClass: string;
  };
  propertyCards: {
    gridClass: string;
    cardClass: string;
    imageClass: string;
    contentClass: string;
  };
  propertyDetail: {
    layout: 'horizontal' | 'vertical' | 'sidebar-left' | 'sidebar-right';
    mainClass: string;
    sidebarClass: string;
    imageClass: string;
    infoClass: string;
  };
  buttons: {
    primaryClass: string;
    secondaryClass: string;
    iconClass: string;
  };
  forms: {
    inputClass: string;
    labelClass: string;
    groupClass: string;
  };
}

export function getSeedLayout(seed: number): LayoutConfig {
  // Static layout: ignore seed
  const normalizedSeed = 1;
  
  const layouts: Record<number, LayoutConfig> = {
    1: {
      searchBar: {
        position: 'center',
        containerClass: 'w-full flex justify-center',
        wrapperClass: 'rounded-[32px] shadow-md bg-white flex flex-row items-center px-2 py-1 min-w-[900px] max-w-3xl border',
        fieldClass: 'flex-[2] flex flex-col px-3 py-2 rounded-[24px] cursor-pointer hover:bg-neutral-100 transition-all relative',
        buttonClass: 'ml-3 px-4 py-2 rounded-full bg-[#616882] text-white font-semibold text-lg flex items-center shadow-md border border-neutral-200 hover:bg-[#9ba6ce] focus:outline-none transition-all'
      },
      propertyCards: {
        gridClass: 'grid gap-7 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
        cardClass: 'bg-white max-w-[275px] rounded-3xl shadow-md border flex flex-col overflow-hidden group relative transition hover:-translate-y-0.5 hover:shadow-xl cursor-pointer',
        imageClass: 'relative aspect-[1.25/1] overflow-hidden',
        contentClass: 'p-4 flex flex-col gap-1 pb-2'
      },
      propertyDetail: {
        layout: 'horizontal',
        mainClass: 'relative flex flex-row gap-10 w-full max-w-6xl mx-auto mt-7',
        sidebarClass: 'w-[350px] min-w-[300px] bg-white shadow-md rounded-2xl border flex flex-col p-6 sticky top-8 h-fit',
        imageClass: 'relative aspect-[1.25/1] overflow-hidden',
        infoClass: 'flex-1 min-w-0 pr-6'
      },
      buttons: {
        primaryClass: 'rounded-lg w-full py-3 text-white font-semibold text-base bg-[#616882] hover:bg-[#8692bd] transition mb-3 shadow focus:outline-none',
        secondaryClass: 'px-4 py-2 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700 transition',
        iconClass: 'p-2 bg-white border border-neutral-200 rounded-full hover:shadow transition'
      },
      forms: {
        inputClass: 'w-full border px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300',
        labelClass: 'text-xs font-semibold text-neutral-500 pb-0.5',
        groupClass: 'flex-1 flex flex-col px-3 py-2 rounded-[24px] cursor-pointer hover:bg-neutral-100 transition-all relative'
      }
    },
    2: {
      searchBar: {
        position: 'right',
        containerClass: 'w-full flex justify-end pr-8',
        wrapperClass: 'rounded-[28px] shadow-lg bg-gradient-to-r from-white to-gray-50 flex flex-row items-center px-3 py-2 min-w-[850px] max-w-2xl border-2 border-gray-200',
        fieldClass: 'flex-[2] flex flex-col px-4 py-3 rounded-[20px] cursor-pointer hover:bg-gray-50 transition-all relative border border-transparent hover:border-gray-300',
        buttonClass: 'ml-4 px-6 py-3 rounded-full bg-gradient-to-r from-[#616882] to-[#8692bd] text-white font-bold text-lg flex items-center shadow-lg border-0 hover:from-[#8692bd] hover:to-[#616882] focus:outline-none transition-all transform hover:scale-105'
      },
      propertyCards: {
        gridClass: 'grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
        cardClass: 'bg-gradient-to-br from-white to-gray-50 max-w-[260px] rounded-2xl shadow-lg border-2 border-gray-100 flex flex-col overflow-hidden group relative transition hover:-translate-y-1 hover:shadow-2xl cursor-pointer transform hover:scale-105',
        imageClass: 'relative aspect-[1.3/1] overflow-hidden',
        contentClass: 'p-5 flex flex-col gap-2 pb-3'
      },
      propertyDetail: {
        layout: 'sidebar-right',
        mainClass: 'relative flex flex-row-reverse gap-8 w-full max-w-7xl mx-auto mt-8',
        sidebarClass: 'w-[380px] min-w-[320px] bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-3xl border-2 border-gray-200 flex flex-col p-8 sticky top-8 h-fit',
        imageClass: 'relative aspect-[1.2/1] overflow-hidden rounded-2xl',
        infoClass: 'flex-1 min-w-0 pl-8'
      },
      buttons: {
        primaryClass: 'rounded-xl w-full py-4 text-white font-bold text-lg bg-gradient-to-r from-[#616882] to-[#8692bd] hover:from-[#8692bd] hover:to-[#616882] transition mb-4 shadow-xl focus:outline-none transform hover:scale-105',
        secondaryClass: 'px-6 py-3 text-base rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition transform hover:scale-105',
        iconClass: 'p-3 bg-white border-2 border-gray-200 rounded-full hover:shadow-lg transition transform hover:scale-110'
      },
      forms: {
        inputClass: 'w-full border-2 border-gray-200 px-5 py-3 rounded-xl text-base outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400',
        labelClass: 'text-sm font-bold text-gray-600 pb-1',
        groupClass: 'flex-1 flex flex-col px-4 py-3 rounded-[20px] cursor-pointer hover:bg-gray-50 transition-all relative border border-transparent hover:border-gray-300'
      }
    },
    3: {
      searchBar: {
        position: 'top',
        containerClass: 'w-full flex justify-center pt-4',
        wrapperClass: 'rounded-[36px] shadow-xl bg-white flex flex-row items-center px-4 py-3 min-w-[950px] max-w-4xl border-2 border-gray-300',
        fieldClass: 'flex-[2] flex flex-col px-5 py-4 rounded-[28px] cursor-pointer hover:bg-blue-50 transition-all relative border-2 border-transparent hover:border-blue-200',
        buttonClass: 'ml-5 px-8 py-4 rounded-full bg-[#616882] text-white font-extrabold text-xl flex items-center shadow-2xl border-0 hover:bg-[#8692bd] focus:outline-none transition-all transform hover:scale-110'
      },
      propertyCards: {
        gridClass: 'grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
        cardClass: 'bg-white max-w-[300px] rounded-[24px] shadow-2xl border-2 border-gray-200 flex flex-col overflow-hidden group relative transition hover:-translate-y-2 hover:shadow-3xl cursor-pointer transform hover:scale-110',
        imageClass: 'relative aspect-[1.4/1] overflow-hidden',
        contentClass: 'p-6 flex flex-col gap-3 pb-4'
      },
      propertyDetail: {
        layout: 'vertical',
        mainClass: 'relative flex flex-col gap-12 w-full max-w-5xl mx-auto mt-10',
        sidebarClass: 'w-full bg-white shadow-2xl rounded-[24px] border-2 border-gray-200 flex flex-col p-8',
        imageClass: 'relative aspect-[2/1] overflow-hidden rounded-[20px]',
        infoClass: 'w-full'
      },
      buttons: {
        primaryClass: 'rounded-[20px] w-full py-5 text-white font-extrabold text-xl bg-[#616882] hover:bg-[#8692bd] transition mb-5 shadow-2xl focus:outline-none transform hover:scale-105',
        secondaryClass: 'px-8 py-4 text-lg rounded-full bg-[#616882] text-white hover:bg-[#8692bd] transition transform hover:scale-105',
        iconClass: 'p-4 bg-white border-2 border-gray-300 rounded-full hover:shadow-xl transition transform hover:scale-125'
      },
      forms: {
        inputClass: 'w-full border-2 border-gray-300 px-6 py-4 rounded-[20px] text-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        labelClass: 'text-base font-bold text-gray-700 pb-2',
        groupClass: 'flex-1 flex flex-col px-5 py-4 rounded-[28px] cursor-pointer hover:bg-blue-50 transition-all relative border-2 border-transparent hover:border-blue-200'
      }
    },
    4: {
      searchBar: {
        position: 'bottom',
        containerClass: 'w-full flex justify-center pb-4',
        wrapperClass: 'rounded-[20px] shadow-md bg-gray-100 flex flex-row items-center px-3 py-2 min-w-[800px] max-w-2xl border border-gray-300',
        fieldClass: 'flex-[2] flex flex-col px-3 py-2 rounded-[16px] cursor-pointer hover:bg-white transition-all relative',
        buttonClass: 'ml-2 px-3 py-2 rounded-full bg-[#616882] text-white font-medium text-base flex items-center shadow-sm border border-gray-400 hover:bg-[#8692bd] focus:outline-none transition-all'
      },
      propertyCards: {
        gridClass: 'grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
        cardClass: 'bg-gray-50 max-w-[250px] rounded-xl shadow-sm border border-gray-300 flex flex-col overflow-hidden group relative transition hover:-translate-y-1 hover:shadow-md cursor-pointer',
        imageClass: 'relative aspect-[1.2/1] overflow-hidden',
        contentClass: 'p-3 flex flex-col gap-1 pb-2'
      },
      propertyDetail: {
        layout: 'sidebar-left',
        mainClass: 'relative flex flex-row gap-6 w-full max-w-5xl mx-auto mt-6',
        sidebarClass: 'w-[300px] min-w-[250px] bg-gray-50 shadow-sm rounded-xl border border-gray-300 flex flex-col p-4 sticky top-8 h-fit',
        imageClass: 'relative aspect-[1.1/1] overflow-hidden rounded-lg',
        infoClass: 'flex-1 min-w-0 pl-6'
      },
      buttons: {
        primaryClass: 'rounded-lg w-full py-2 text-white font-medium text-base bg-[#616882] hover:bg-[#8692bd] transition mb-2 shadow-sm focus:outline-none',
        secondaryClass: 'px-3 py-2 text-sm rounded-full bg-[#616882] text-white hover:bg-[#8692bd] transition',
        iconClass: 'p-1.5 bg-gray-50 border border-gray-300 rounded-full hover:bg-white transition'
      },
      forms: {
        inputClass: 'w-full border border-gray-300 px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300',
        labelClass: 'text-xs font-medium text-gray-600 pb-0.5',
        groupClass: 'flex-1 flex flex-col px-3 py-2 rounded-[16px] cursor-pointer hover:bg-white transition-all relative'
      }
    },
    5: {
      searchBar: {
        position: 'left',
        containerClass: 'w-full flex justify-start pl-8',
        wrapperClass: 'rounded-[40px] shadow-lg bg-white flex flex-row items-center px-4 py-3 min-w-[900px] max-w-3xl border-2 border-blue-200',
        fieldClass: 'flex-[2] flex flex-col px-5 py-3 rounded-[32px] cursor-pointer hover:bg-blue-50 transition-all relative border border-transparent hover:border-blue-300',
        buttonClass: 'ml-4 px-6 py-3 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center shadow-lg border-0 hover:bg-blue-700 focus:outline-none transition-all'
      },
      propertyCards: {
        gridClass: 'grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
        cardClass: 'bg-white max-w-[280px] rounded-[20px] shadow-lg border border-blue-200 flex flex-col overflow-hidden group relative transition hover:-translate-y-1 hover:shadow-xl cursor-pointer',
        imageClass: 'relative aspect-[1.3/1] overflow-hidden',
        contentClass: 'p-4 flex flex-col gap-2 pb-3'
      },
      propertyDetail: {
        layout: 'horizontal',
        mainClass: 'relative flex flex-row gap-8 w-full max-w-6xl mx-auto mt-8',
        sidebarClass: 'w-[360px] min-w-[300px] bg-white shadow-lg rounded-[20px] border border-blue-200 flex flex-col p-6 sticky top-8 h-fit',
        imageClass: 'relative aspect-[1.25/1] overflow-hidden rounded-lg',
        infoClass: 'flex-1 min-w-0 pr-8'
      },
      buttons: {
        primaryClass: 'rounded-[16px] w-full py-3 text-white font-bold text-base bg-blue-600 hover:bg-blue-700 transition mb-3 shadow-lg focus:outline-none',
        secondaryClass: 'px-5 py-2 text-base rounded-full bg-blue-600 text-white hover:bg-blue-700 transition',
        iconClass: 'p-2 bg-white border border-blue-200 rounded-full hover:shadow-md transition'
      },
      forms: {
        inputClass: 'w-full border border-blue-200 px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400',
        labelClass: 'text-xs font-bold text-blue-600 pb-1',
        groupClass: 'flex-1 flex flex-col px-5 py-3 rounded-[32px] cursor-pointer hover:bg-blue-50 transition-all relative border border-transparent hover:border-blue-300'
      }
    },
    6: {
      searchBar: {
        position: 'center',
        containerClass: 'w-full flex justify-center',
        wrapperClass: 'rounded-[24px] shadow-xl bg-gradient-to-r from-purple-50 to-pink-50 flex flex-row items-center px-3 py-2 min-w-[850px] max-w-2xl border-2 border-purple-200',
        fieldClass: 'flex-[2] flex flex-col px-4 py-3 rounded-[20px] cursor-pointer hover:bg-white transition-all relative border border-transparent hover:border-purple-300',
        buttonClass: 'ml-3 px-5 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg flex items-center shadow-xl border-0 hover:from-purple-700 hover:to-pink-700 focus:outline-none transition-all'
      },
      propertyCards: {
        gridClass: 'grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
        cardClass: 'bg-gradient-to-br from-white to-purple-50 max-w-[270px] rounded-[24px] shadow-xl border-2 border-purple-200 flex flex-col overflow-hidden group relative transition hover:-translate-y-2 hover:shadow-2xl cursor-pointer',
        imageClass: 'relative aspect-[1.35/1] overflow-hidden',
        contentClass: 'p-5 flex flex-col gap-2 pb-3'
      },
      propertyDetail: {
        layout: 'sidebar-right',
        mainClass: 'relative flex flex-row-reverse gap-10 w-full max-w-7xl mx-auto mt-8',
        sidebarClass: 'w-[370px] min-w-[320px] bg-gradient-to-br from-white to-purple-50 shadow-xl rounded-[24px] border-2 border-purple-200 flex flex-col p-7 sticky top-8 h-fit',
        imageClass: 'relative aspect-[1.3/1] overflow-hidden rounded-[20px]',
        infoClass: 'flex-1 min-w-0 pl-10'
      },
      buttons: {
        primaryClass: 'rounded-[20px] w-full py-4 text-white font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition mb-4 shadow-xl focus:outline-none',
        secondaryClass: 'px-6 py-3 text-base rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition',
        iconClass: 'p-3 bg-white border-2 border-purple-200 rounded-full hover:shadow-lg transition'
      },
      forms: {
        inputClass: 'w-full border-2 border-purple-200 px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400',
        labelClass: 'text-xs font-bold text-purple-600 pb-1',
        groupClass: 'flex-1 flex flex-col px-4 py-3 rounded-[20px] cursor-pointer hover:bg-white transition-all relative border border-transparent hover:border-purple-300'
      }
    },
    7: {
      searchBar: {
        position: 'right',
        containerClass: 'w-full flex justify-end pr-6',
        wrapperClass: 'rounded-[16px] shadow-md bg-white flex flex-row items-center px-2 py-1 min-w-[800px] max-w-2xl border border-gray-400',
        fieldClass: 'flex-[2] flex flex-col px-3 py-2 rounded-[12px] cursor-pointer hover:bg-gray-100 transition-all relative',
        buttonClass: 'ml-2 px-4 py-2 rounded-full bg-[#616882] text-white font-semibold text-base flex items-center shadow-md border border-gray-300 hover:bg-[#8692bd] focus:outline-none transition-all'
      },
      propertyCards: {
        gridClass: 'grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
        cardClass: 'bg-white max-w-[260px] rounded-xl shadow-md border border-gray-300 flex flex-col overflow-hidden group relative transition hover:-translate-y-1 hover:shadow-lg cursor-pointer',
        imageClass: 'relative aspect-[1.2/1] overflow-hidden',
        contentClass: 'p-4 flex flex-col gap-1 pb-2'
      },
      propertyDetail: {
        layout: 'horizontal',
        mainClass: 'relative flex flex-row gap-8 w-full max-w-6xl mx-auto mt-6',
        sidebarClass: 'w-[340px] min-w-[280px] bg-white shadow-md rounded-xl border border-gray-300 flex flex-col p-5 sticky top-8 h-fit',
        imageClass: 'relative aspect-[1.25/1] overflow-hidden rounded-lg',
        infoClass: 'flex-1 min-w-0 pr-6'
      },
      buttons: {
        primaryClass: 'rounded-lg w-full py-3 text-white font-semibold text-base bg-[#616882] hover:bg-[#8692bd] transition mb-3 shadow-md focus:outline-none',
        secondaryClass: 'px-4 py-2 text-sm rounded-full bg-[#616882] text-white hover:bg-[#8692bd] transition',
        iconClass: 'p-2 bg-white border border-gray-300 rounded-full hover:shadow-md transition'
      },
      forms: {
        inputClass: 'w-full border border-gray-300 px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300',
        labelClass: 'text-xs font-semibold text-gray-500 pb-0.5',
        groupClass: 'flex-1 flex flex-col px-3 py-2 rounded-[12px] cursor-pointer hover:bg-gray-100 transition-all relative'
      }
    },
    8: {
      searchBar: {
        position: 'top',
        containerClass: 'w-full flex justify-center pt-6',
        wrapperClass: 'rounded-[44px] shadow-2xl bg-gradient-to-r from-green-50 to-blue-50 flex flex-row items-center px-5 py-4 min-w-[1000px] max-w-4xl border-2 border-green-200',
        fieldClass: 'flex-[2] flex flex-col px-6 py-4 rounded-[36px] cursor-pointer hover:bg-white transition-all relative border-2 border-transparent hover:border-green-300',
        buttonClass: 'ml-6 px-10 py-4 rounded-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-extrabold text-xl flex items-center shadow-2xl border-0 hover:from-green-700 hover:to-blue-700 focus:outline-none transition-all transform hover:scale-105'
      },
      propertyCards: {
        gridClass: 'grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
        cardClass: 'bg-gradient-to-br from-white to-green-50 max-w-[320px] rounded-[28px] shadow-2xl border-2 border-green-200 flex flex-col overflow-hidden group relative transition hover:-translate-y-3 hover:shadow-3xl cursor-pointer transform hover:scale-105',
        imageClass: 'relative aspect-[1.4/1] overflow-hidden',
        contentClass: 'p-6 flex flex-col gap-3 pb-4'
      },
      propertyDetail: {
        layout: 'vertical',
        mainClass: 'relative flex flex-col gap-14 w-full max-w-6xl mx-auto mt-12',
        sidebarClass: 'w-full bg-gradient-to-br from-white to-green-50 shadow-2xl rounded-[28px] border-2 border-green-200 flex flex-col p-8',
        imageClass: 'relative aspect-[2.2/1] overflow-hidden rounded-[24px]',
        infoClass: 'w-full'
      },
      buttons: {
        primaryClass: 'rounded-[24px] w-full py-5 text-white font-extrabold text-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition mb-5 shadow-2xl focus:outline-none transform hover:scale-105',
        secondaryClass: 'px-8 py-4 text-lg rounded-full bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 transition transform hover:scale-105',
        iconClass: 'p-4 bg-white border-2 border-green-200 rounded-full hover:shadow-xl transition transform hover:scale-110'
      },
      forms: {
        inputClass: 'w-full border-2 border-green-200 px-6 py-4 rounded-[20px] text-lg outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400',
        labelClass: 'text-base font-bold text-green-700 pb-2',
        groupClass: 'flex-1 flex flex-col px-6 py-4 rounded-[36px] cursor-pointer hover:bg-white transition-all relative border-2 border-transparent hover:border-green-300'
      }
    },
    9: {
      searchBar: {
        position: 'left',
        containerClass: 'w-full flex justify-start pl-10',
        wrapperClass: 'rounded-[20px] shadow-lg bg-gradient-to-r from-orange-50 to-red-50 flex flex-row items-center px-3 py-2 min-w-[850px] max-w-2xl border-2 border-orange-200',
        fieldClass: 'flex-[2] flex flex-col px-4 py-3 rounded-[16px] cursor-pointer hover:bg-white transition-all relative border border-transparent hover:border-orange-300',
        buttonClass: 'ml-4 px-6 py-3 rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-lg flex items-center shadow-lg border-0 hover:from-orange-700 hover:to-red-700 focus:outline-none transition-all'
      },
      propertyCards: {
        gridClass: 'grid gap-7 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
        cardClass: 'bg-gradient-to-br from-white to-orange-50 max-w-[275px] rounded-[20px] shadow-lg border-2 border-orange-200 flex flex-col overflow-hidden group relative transition hover:-translate-y-2 hover:shadow-xl cursor-pointer',
        imageClass: 'relative aspect-[1.3/1] overflow-hidden',
        contentClass: 'p-4 flex flex-col gap-2 pb-3'
      },
      propertyDetail: {
        layout: 'sidebar-left',
        mainClass: 'relative flex flex-row gap-8 w-full max-w-6xl mx-auto mt-8',
        sidebarClass: 'w-[350px] min-w-[300px] bg-gradient-to-br from-white to-orange-50 shadow-lg rounded-[20px] border-2 border-orange-200 flex flex-col p-6 sticky top-8 h-fit',
        imageClass: 'relative aspect-[1.25/1] overflow-hidden rounded-lg',
        infoClass: 'flex-1 min-w-0 pl-8'
      },
      buttons: {
        primaryClass: 'rounded-[16px] w-full py-3 text-white font-bold text-base bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition mb-3 shadow-lg focus:outline-none',
        secondaryClass: 'px-5 py-2 text-base rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 transition',
        iconClass: 'p-2 bg-white border-2 border-orange-200 rounded-full hover:shadow-md transition'
      },
      forms: {
        inputClass: 'w-full border-2 border-orange-200 px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400',
        labelClass: 'text-xs font-bold text-orange-600 pb-1',
        groupClass: 'flex-1 flex flex-col px-4 py-3 rounded-[16px] cursor-pointer hover:bg-white transition-all relative border border-transparent hover:border-orange-300'
      }
    },
    10: {
      searchBar: {
        position: 'bottom',
        containerClass: 'w-full flex justify-center pb-6',
        wrapperClass: 'rounded-[48px] shadow-2xl bg-gradient-to-r from-indigo-50 to-purple-50 flex flex-row items-center px-6 py-5 min-w-[1100px] max-w-5xl border-2 border-indigo-200',
        fieldClass: 'flex-[2] flex flex-col px-7 py-5 rounded-[40px] cursor-pointer hover:bg-white transition-all relative border-2 border-transparent hover:border-indigo-300',
        buttonClass: 'ml-7 px-12 py-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-2xl flex items-center shadow-2xl border-0 hover:from-indigo-700 hover:to-purple-700 focus:outline-none transition-all transform hover:scale-110'
      },
      propertyCards: {
        gridClass: 'grid gap-12 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
        cardClass: 'bg-gradient-to-br from-white to-indigo-50 max-w-[350px] rounded-[32px] shadow-2xl border-2 border-indigo-200 flex flex-col overflow-hidden group relative transition hover:-translate-y-4 hover:shadow-3xl cursor-pointer transform hover:scale-110',
        imageClass: 'relative aspect-[1.5/1] overflow-hidden',
        contentClass: 'p-7 flex flex-col gap-3 pb-5'
      },
      propertyDetail: {
        layout: 'sidebar-right',
        mainClass: 'relative flex flex-row-reverse gap-12 w-full max-w-8xl mx-auto mt-14',
        sidebarClass: 'w-[400px] min-w-[350px] bg-gradient-to-br from-white to-indigo-50 shadow-2xl rounded-[32px] border-2 border-indigo-200 flex flex-col p-8 sticky top-8 h-fit',
        imageClass: 'relative aspect-[1.4/1] overflow-hidden rounded-[28px]',
        infoClass: 'flex-1 min-w-0 pl-12'
      },
      buttons: {
        primaryClass: 'rounded-[28px] w-full py-6 text-white font-black text-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition mb-6 shadow-2xl focus:outline-none transform hover:scale-105',
        secondaryClass: 'px-10 py-4 text-lg rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition transform hover:scale-105',
        iconClass: 'p-5 bg-white border-2 border-indigo-200 rounded-full hover:shadow-xl transition transform hover:scale-125'
      },
      forms: {
        inputClass: 'w-full border-2 border-indigo-200 px-7 py-5 rounded-[24px] text-xl outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400',
        labelClass: 'text-lg font-black text-indigo-700 pb-3',
        groupClass: 'flex-1 flex flex-col px-7 py-5 rounded-[40px] cursor-pointer hover:bg-white transition-all relative border-2 border-transparent hover:border-indigo-300'
      }
    }
  };

  return layouts[normalizedSeed] || layouts[1];
} 
