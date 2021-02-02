import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  blogs: Blog[] = [
    { title: "A look back at 2020", date: "December 18, 2020", link: "recap" },
    { title: "Overhauling the SM64 time tracker", date: "June 14, 2020", link: "speedrun/update" },
    { title: "Another hobby, another project (Yu-Gi-Oh!)", date: "March 10, 2020", link: "yugioh" },
    { title: "Migrating the core features of the original encounter simulator", date: "November 24, 2019", link: "initiative" },
    { title: "Tracking bowling scores and visualizing interesting statistics", date: "October 2, 2019", link: "bowling" },
    { title: "Uploading and comparing Super Mario 64 speedrun times", date: "October 1, 2019", link: "speedrun" },
    { title: "Building my portfolio website", date: "October 1, 2019", link: "portfolio" },
    { title: "A Dungeons and Dragons encounter tracker", date: "September 30, 2019", link: "encounter" }
  ];

  constructor() { }

  ngOnInit() {
  }
}

class Blog {
  public title: string;

  public date: string;

  public link: string;
}
