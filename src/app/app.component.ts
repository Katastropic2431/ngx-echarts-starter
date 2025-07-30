import { Component, inject } from '@angular/core';
import { MockServerService } from './mock-server.service';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { echarts } from './custom-echarts';
import type { EChartsCoreOption } from 'echarts/core';
import { BarChart, TreeChart } from 'echarts/charts';
import {
  TitleComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as util from 'zrender/lib/core/util';
import { AsyncPipe } from '@angular/common';

echarts.use([BarChart, TitleComponent, LegendComponent, TooltipComponent, TreeChart]);
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgxEchartsDirective, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [provideEchartsCore({ echarts })],
})
export class AppComponent {
  private http = inject(HttpClient);

  BarOptions!: EChartsCoreOption;
  treeOptions!: Observable<EChartsCoreOption>;

  options = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line',
      },
    ],
  };

  mergeOption: any;
  loading = false;

  constructor(private api: MockServerService) {}

  getData() {
    this.loading = true;
    this.api
      .getData()
      .then((data) => {
        this.mergeOption = { series: [{ data }] };
      })
      .then(() => {
        this.loading = false;
      });
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.treeOptions = this.http
      .get<any>('assets/data/flare.json', { responseType: 'json' })
      .pipe(
        map((data) => {
          util.each(data.children, (datum: any, index?: string | number) => {
            if (typeof index === 'number' && index % 2 === 0) {
              datum.collapsed = true;
            }
          });
          return {
            tooltip: {
              trigger: 'item',
              triggerOn: 'mousemove',
            },
            series: [
              {
                type: 'tree',
                data: [data],
                top: '1%',
                left: '7%',
                bottom: '1%',
                right: '20%',
                symbolSize: 7,
                label: {
                  position: 'left',
                  verticalAlign: 'middle',
                  align: 'right',
                  fontSize: 9,
                },
                leaves: {
                  label: {
                    position: 'right',
                    verticalAlign: 'middle',
                    align: 'left',
                  },
                },
                expandAndCollapse: true,
                animationDuration: 550,
                animationDurationUpdate: 750,
              },
            ],
          };
        })
      );

    const xAxisData = [];
    const data1 = [];
    const data2 = [];

    for (let i = 0; i < 100; i++) {
      xAxisData.push('category' + i);
      data1.push((Math.sin(i / 5) * (i / 5 - 10) + i / 6) * 5);
      data2.push((Math.cos(i / 5) * (i / 5 - 10) + i / 6) * 5);
    }

    const createAnimationDelay =
      (baseDelay: number) =>
      (idx: number): number =>
        idx * 10 + baseDelay;

    this.BarOptions = {
      legend: {
        data: ['bar', 'bar2'],
        align: 'left',
      },
      tooltip: {},
      xAxis: {
        data: xAxisData,
        silent: false,
        splitLine: {
          show: false,
        },
      },
      yAxis: {},
      series: [
        {
          name: 'bar',
          type: 'bar',
          data: data1,
          animationDelay: createAnimationDelay(0),
        },
        {
          name: 'bar2',
          type: 'bar',
          data: data2,
          animationDelay: createAnimationDelay(100),
        },
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx) => idx * 5,
    };
  }
}
