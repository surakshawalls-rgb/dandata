import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

import { Location } from '@angular/common';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamComponent {

  readonly teamImages: string[] = [
    'abb.jpeg',
    'ajay.jpeg',
    'anita.jpeg',
    'bau.jpeg',
    'bhola.jpeg',
    'chandresh.jpeg',
    'garib.jpeg',
    'goli.jpeg',
    'karau.jpeg',
    'lala.jpeg',
    'lavkush.jpeg',
    'munna.jpeg',
    'munnapradhan.jpeg',
    'nankau.jpeg',
    'neeraj.jpeg',
    'pappu.jpeg',
    'pintu.jpeg',
    'Pradeep.JPG',
    'pramod.jpeg',
    'radheshyam.jpeg',
    'rajan.jpeg',
    'ravi.jpeg',
    'santosh.jpeg',
    'satyanarayan.jpeg',
    'shivlal.jpeg',
    'suraj.jpeg',
    'surendra.jpeg',
    'vikas.jpeg',
    'vinod.jpeg',
    'virendra.jpeg',
  ];

  constructor(
    private readonly location: Location,
  ) {}

  goBack(): void {
    this.location.back();
  }
}