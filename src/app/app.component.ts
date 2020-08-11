import { Component, OnInit } from '@angular/core';
import { Data } from '../app/models/data.model'
import { DataService } from '../app/services/data.service';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { DataRequest } from './models/dataRequest.model';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  dataCreateForm: FormGroup;
  data: Data = new Data();
  keyWords: FormArray;
  kw: string[] = [];
  regions: any;
  chooseSearchEngine: boolean;
  chooseRegion: boolean;
  dataRequest: DataRequest = new DataRequest();
  displayedColumns: string[] = ['Keywords', 'Search Engine', 'WebSite', 'Position', 'Status'];
  dataSource: Data[] = [];

  constructor(private dataService: DataService, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.dataCreateForm = this.fb.group({
        searchEngine: ['', Validators.required],
        region: ['', Validators.required],
        webSite: ['', Validators.required],
        keyWords: this.fb.array([ this.createItem()], Validators.required)
    });

    this.dataService.getData().subscribe(data => {
      this.dataSource = data;
      this.dataSource.forEach(elem => {
        this.dataService.checkStatusTask(elem.searchEngine, elem.taskId).subscribe(data => {
          if(data.tasks[0].status_code === 20000){
            var position = data.tasks[0].result[0].items.filter(obj => {

              return obj.domain === elem.webSite || obj.domain === 'www.' + elem.webSite;
            });
            
            elem.position = position[0].rank_group;
            if(elem.position !== 0){
              elem.status = "tracked";

              this.dataService.editData(elem).subscribe(data => {
                this.dataService.getData().subscribe(data => {
                  this.dataSource = data;
                })
              });
              
            }
          }
        });
      });
    });

    this.chooseSearchEngine = true;
    this.chooseRegion = true;
  }

  addItem(): void {
    this.keyWords = this.dataCreateForm.get('keyWords') as FormArray;
    this.keyWords.push(this.createItem());
  }

  removeItem(): void {
    this.keyWords = this.dataCreateForm.get('keyWords') as FormArray;
    if(this.keyWords.length !== 1){
      this.keyWords.removeAt(this.keyWords.length - 1);
    }
  }

  createItem(): FormGroup {
    return this.fb.group({
      keyWord: ['', Validators.required],
    });
  }

  onChangeSearchEngineLoadRegions(event){
    this.chooseSearchEngine = false;
    this.dataService.getRegions(event.value).subscribe(data => {
      console.log(data)
      this.regions = data.tasks[0].result;
      console.log(this.regions);
    });
  }

  onChangeRegionAbleWebsiteInput(){
    this.chooseRegion = false;
  }

  onSubmit(){
    var array = this.dataCreateForm.get('keyWords') as FormArray;
    console.log(array);
    for(let i = 0; i < array.length; i++){
      this.kw.push(array.value[i].keyWord);
    }

    this.dataRequest.locationCode = this.regions.filter(obj => {
      return obj.location_name === this.dataCreateForm.get('region').value;
    })[0].location_code;
    this.dataRequest.keyWords = this.kw;
    this.dataRequest.region = this.dataCreateForm.get('region').value;
    this.dataRequest.searchEngine = this.dataCreateForm.get('searchEngine').value;

    this.dataService.send(this.dataRequest).subscribe(data => {
      data.tasks.forEach(element => {
        this.data.taskId = element.id;
        this.data.keyWord = element.data.keyword;
        this.data.webSite = this.dataCreateForm.get('webSite').value;
        this.data.status = 'processing';
        this.data.searchEngine = this.dataCreateForm.get('searchEngine').value;
        this.data.position = 0;

        this.dataService.createData(this.data).subscribe(data => {
          this.dataCreateForm.reset();
          this.dataService.getData().subscribe(data => {
            this.dataSource = data;
            setTimeout(function(){
              document.location.reload(true);
            }, 10000);
          })
        });
      });

      this.dataService.getData().subscribe(data => {
        this.dataSource = data;
      })
    })

    
  }
}
