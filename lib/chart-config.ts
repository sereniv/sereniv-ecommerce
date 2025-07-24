import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

const registeredComponents = new Set<string>()

export const registerChartComponents = (components: string[]) => {
  const toRegister: any[] = []
  
  components.forEach(component => {
    if (!registeredComponents.has(component)) {
      registeredComponents.add(component)
      
      switch (component) {
        case 'CategoryScale':
          toRegister.push(CategoryScale)
          break
        case 'LinearScale':
          toRegister.push(LinearScale)
          break
        case 'PointElement':
          toRegister.push(PointElement)
          break
        case 'LineElement':
          toRegister.push(LineElement)
          break
        case 'LineController':
          toRegister.push(LineController)
          break
        case 'BarElement':
          toRegister.push(BarElement)
          break
        case 'BarController':
          toRegister.push(BarController)
          break
        case 'ArcElement':
          toRegister.push(ArcElement)
          break
        case 'Title':
          toRegister.push(Title)
          break
        case 'Tooltip':
          toRegister.push(Tooltip)
          break
        case 'Legend':
          toRegister.push(Legend)
          break
        case 'Filler':
          toRegister.push(Filler)
          break
      }
    }
  })
  
  if (toRegister.length > 0) {
    ChartJS.register(...toRegister)
  }
}

export const pieChartComponents = ['ArcElement', 'Tooltip', 'Legend']
export const lineChartComponents = ['CategoryScale', 'LinearScale', 'PointElement', 'LineElement', 'LineController', 'Title', 'Tooltip', 'Legend', 'Filler']
export const barChartComponents = ['CategoryScale', 'LinearScale', 'BarElement', 'BarController', 'Title', 'Tooltip', 'Legend']
export const mixedChartComponents = ['CategoryScale', 'LinearScale', 'PointElement', 'LineElement', 'LineController', 'BarElement', 'BarController', 'Title', 'Tooltip', 'Legend', 'Filler'] 