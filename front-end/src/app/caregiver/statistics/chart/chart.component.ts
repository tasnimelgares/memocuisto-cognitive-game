import { Component, Input, OnInit, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import Chart from 'chart.js/auto'; //  npm install chart.js


@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent implements AfterViewInit{
  @Input() chartId: string = 'myChart'; // ID unique pour chaque graphique
  @Input() labels: string[] = [];       // Les dates (ex: ["1 mars", "2 mars"])
  @Input() allData: any[] = [];        // vient du mcok
  @Input() label: string = 'Valeur';    // Titre de la légende
  @Input() color: string = '#2ecc71';   
  @Input() dataType: string = 'score';
  @Input() title: string = 'le titre';

  filterDiff: string = 'all';
  private chartInstance: any;

  ngAfterViewInit(): void {
    this.createChart(); // coquille vide du graphique
  }

  // écoute les changements, quand allData se remplit
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allData'] && this.chartInstance) {
      this.updateChart();
    }
  }

  updateChart() {
    if (!this.allData || this.allData.length === 0) return;
    // On filtre le Mock selon la difficulté choisie
    const filteredData = this.allData.filter(d => 
      this.filterDiff === 'all' || d.config?.difficulte === this.filterDiff
    );
    // extrait les nouvelles dates et valeurs
    const newLabels = filteredData.map(p => p.date);
    const newValues = filteredData.map(p => {
      if (this.dataType === 'score') {
        const trouve = p.etape1.ingredientsBons + p.etape2.objetsBienRanges + p.etape3.etapesBienOrdonnees;
        const total = p.etape1.ingredientsTotal + p.etape2.objetsTotal + p.etape3.etapesTotal;
        return Math.round((trouve / total) * 100) || 0;
      } 
      else if (this.dataType === 'temps') {
        // tps total converti en min ( 1 chiffre après la virgule)
        return parseFloat((p.global.tempsTotal / 60).toFixed(1)) || 0;
      }
      return 0;
    });
    //injecte les nouvelles données et demande à Chart.js de se rafraîchir
    if (this.chartInstance) {
      this.chartInstance.data.labels = newLabels;
      this.chartInstance.data.datasets[0].data = newValues;
      this.chartInstance.update(); 
    }
  }

  

  createChart() {
      this.chartInstance = new Chart(this.chartId, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: this.label,
            data: [],
            borderColor: this.color,
            backgroundColor: this.color + '33', // transparence (33 en hexa)
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
      this.updateChart();
    }
}