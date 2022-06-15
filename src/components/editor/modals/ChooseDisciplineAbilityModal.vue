<template>
  <Modal :shown="shown" v-if="editingCharacter && discipline && callback" @close="shown = false">
    <div style="width: 50rem; display: flex; flex-direction: column; gap: 2rem">
      <p style="margin: 0; font-weight: bold; font-size: 1.6rem">{{$t('editor.disciplines.choose.title', {disc: discipline.discipline.name, lvl: discipline.currentLevel})}}</p>

      <select class="form-control" v-model="ability">
        <option v-for="a in availableAbilities" :class="{'not-selectable': !isAbilitySelectable(a)}" :value="a">{{a.name}} - {{$t('editor.disciplines.level')}}: {{a.level}}{{isAbilitySelectable(a) ? '' : ' - ' + $t('editor.disciplines.notselectable')}}</option>
      </select>

      <div class="info" v-if="ability">
        <small><i>{{ability.summary}}</i></small>
        <hr>
        <small v-if="ability.requirement"><b>{{$t('editor.disciplines.requirement')}}</b>: {{getRequirement(ability)}}</small>
        <small v-if="ability.combination"><b>{{$t('editor.disciplines.combo')}}</b>: {{getCombo(ability)}}</small>
        <hr v-if="ability.combination || ability.requirement">
        <span><b>{{$t('editor.disciplines.costs')}}</b>: {{ability.costs}}</span>
        <span v-if="ability.diceSupplies"><b>{{$t('editor.disciplines.dices')}}</b>: {{ability.diceSupplies}}</span>
        <span><b>{{$t('editor.disciplines.system')}}</b>: {{ability.system}}</span>
        <small v-if="ability.alternatives"><b>{{$t('editor.disciplines.alternatives')}}</b>: {{ability.alternatives.join(", ")}}</small>
        <span><b>{{$t('editor.disciplines.duration')}}</b>: {{ability.duration}}</span>
      </div>

      <div style="width: 100%; display: flex; justify-content: center; align-items: center">
        <button class="btn btn-primary" :disabled="!canSelectAbility" @click="addCurrentAbility">{{$t('editor.choose')}}</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {ICharacter, IDisciplineSelection, ILeveledDisciplineAbility} from "@/types/models";
import {State} from "vuex-class";
import DataManager from "@/libs/data-manager";
import {disciplineAbilityResolver} from "@/libs/resolvers/disciplineability-resolver";

export type ChooseAbilityCallback = (ability: ILeveledDisciplineAbility) => void;

@Component({
  components: {Modal}
})
export default class ChooseDisciplineAbilityModal extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  private shown: boolean = false;
  private ability: ILeveledDisciplineAbility|null = null;

  private discipline: IDisciplineSelection|null = null;
  private abilities: ILeveledDisciplineAbility[] = [];
  private callback: ChooseAbilityCallback|null = null;

  public showModal(discipline: IDisciplineSelection, callback: ChooseAbilityCallback) {
    this.discipline = discipline;
    this.abilities = DataManager.normalToLeveledAbilities(discipline.discipline);
    this.callback = callback;
    this.shown = true;
  }

  private addCurrentAbility() {
    if (this.canSelectAbility && this.discipline) {
      this.callback!(this.ability!);
      this.shown = false;
    }
  }

  private isAbilitySelectable(ability: ILeveledDisciplineAbility): boolean {
    return disciplineAbilityResolver.resolve(this.editingCharacter!, ability);
  }

  private getCombo(ability: ILeveledDisciplineAbility): string {
    if (!ability.combination) {
      return "";
    }

    return (DataManager.getDiscipline(ability.combination.id)?.name ?? "") + " " + ability.combination.level;
  }

  private getRequirement(ability: ILeveledDisciplineAbility): string {
    if (!ability.requirement) {
      return "";
    }
    return this.abilities.find(a => a.id === ability.requirement)?.name ?? "";
  }

  private hasAbility(ability: ILeveledDisciplineAbility): boolean {
    return this.discipline?.abilities.find(a => a.id === ability.id) !== undefined;
  }

  private get availableAbilities(): ILeveledDisciplineAbility[] {
    return this.abilities.filter(ability => ability.level <= this.discipline!.currentLevel && !this.hasAbility(ability));
  }

  private get canSelectAbility(): boolean {
    return !!this.ability && disciplineAbilityResolver.resolve(this.editingCharacter!, this.ability);
  }
}
</script>

<style scoped lang="scss">
.info {
  max-height: 50rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  gap: 1rem;
}
.not-selectable {
  font-style: italic;
  color: rgba(255, 255, 255, 0.6) !important;
}
</style>