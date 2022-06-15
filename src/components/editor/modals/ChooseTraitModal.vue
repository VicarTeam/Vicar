<template>
  <Modal :shown="show" v-if="editingCharacter && data" @close="show = false">
    <div style="width: 60rem; display: flex; flex-direction: column; gap: 0.5rem">
      <div style="width: 100%; display: flex; gap: 1rem; align-items: center;">
        <b style="flex-grow: 1">{{$t('editor.traits.modal.title.' + (isFlaw ? 'flaw' : 'trait'))}}:</b>
        <select class="form-control categorized" v-model="selectedPack" @change="selectTrait(null)">
          <option class="category" disabled>{{$t('data.trait.merits')}}</option>
          <option v-for="m in merits" :value="m">{{m.name}}</option>

          <option class="category" disabled>{{$t('data.trait.backgrounds')}}</option>
          <option v-for="b in backgrounds" :value="b">{{b.name}}</option>
        </select>
      </div>

      <div style="width: 100%; display: flex; gap: 2rem; flex-direction: column" v-if="selectedPack">
        <small>{{selectedPack.description}}</small>

        <div class="trait-pack-content">
          <div class="traits">
            <div class="trait" v-for="trait in traits" @click="selectTrait(trait)" :class="{'selected': trait === selectedTrait}">
              <b>{{trait.name}}</b> - <small><i><b>{{$t('editor.traits.modal.trait.level')}}</b>: {{trait.level}}</i></small>
            </div>
          </div>

          <div class="border"></div>

          <div class="info" :class="{'not-selected': !selectedTrait}">
            <small v-if="!selectedTrait">{{$t('editor.traits.modal.info.notselected')}}</small>
            <small v-else>{{selectedTrait.description}}</small>
          </div>
        </div>
      </div>

      <div class="optional-trait-options" v-if="selectedTrait">
        <div class="form-group" style="width: 50%">
          <label>{{$t('editor.traits.modal.optionals.level')}}:</label>
          <input class="form-control" type="number" v-model="customLevel" :min="minCustomLevel" :max="maxCustomLevel"/>
        </div>
        <div class="form-group" style="width: 50%">
          <label>{{$t('editor.traits.modal.optionals.suffix')}}:</label>
          <input class="form-control" type="text" v-model="specialization"/>
        </div>
      </div>

      <div style="width: 100%; margin-top: 1rem; text-align: center">
        <button class="btn btn-primary" :disabled="!isReady" @click="addSelectedTrait">{{$t('editor.choose')}}</button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import Modal from "@/components/modal/Modal.vue";
import {State} from "vuex-class";
import {ICharacter, IUsingTraitPacks} from "@/types/models";
import {ITrait, ITraitPack} from "@/types/data";
import DataManager from "@/libs/data-manager";
import {restrictionResolver} from "@/libs/resolvers/restriction-resolver";
import PTActionHandler from "@/libs/ptaction-handler";

export type ChooseTraitData = {
  merits: ITraitPack[];
  backgrounds: ITraitPack[];
}

@Component({
  components: {Modal}
})
export default class ChooseTraitModal extends Vue {

  @State("editingCharacter")
  private editingCharacter!: ICharacter|undefined;

  private selectedPack: ITraitPack|null = null;
  private selectedTrait: ITrait|null = null;

  private customLevel: number = 0;
  private maxCustomLevel: number = 0;
  private specialization: string = "";

  private show: boolean = false;
  private isFlaw: boolean = false;
  private pointsLeft: number = 0;
  private data: ChooseTraitData = null!;

  mounted() {
    this.data = {
      backgrounds: DataManager.selectedLanguage.books.flatMap(book => {
        if (book && book.backgrounds) {
          return book.backgrounds;
        }
        return [];
      }),
      merits: DataManager.selectedLanguage.books.flatMap(book => {
        if (book && book.merits) {
          return book.merits;
        }
        return [];
      })
    };
  }

  public showModal(isFlaw: boolean, pointsLeft: number) {
    this.selectedTrait = null;
    this.selectedPack = null;
    this.isFlaw = isFlaw;
    this.pointsLeft = pointsLeft;
    this.show = true;
  }

  private addSelectedTrait() {
    if (!this.isReady || !this.selectedTrait || !this.selectedPack || !this.editingCharacter) {
      return;
    }

    const upack = PTActionHandler.initializeTraitPack(this.editingCharacter, this.selectedPack, this.selectedPack.type);
    (this.isFlaw ? upack.flawTraits : upack.traits).push({
      ...this.selectedTrait,
      customLevel: this.customLevel,
      suffix: this.specialization,
      isLocked: false,
      isManual: true
    });

    this.show = false;
  }

  private selectTrait(trait: ITrait) {
    this.selectedTrait = trait;
    this.specialization = "";
    if (trait) {
      this.customLevel = trait.level;
      this.maxCustomLevel = this.getMaxCustomLevel();
    }
  }

  private filterTraitPacks(packs: ITraitPack[]): ITraitPack[] {
    return DataManager.filterRestrictions(this.editingCharacter, packs);
  }

  private filterTraits(pack: ITraitPack, traits: ITrait[]): ITrait[] {
    const pointsRequirement = traits.filter(t => t.level <= this.pointsLeft);
    const usedFiltered = pointsRequirement.filter(t => !this.doesTraitExist(this.editingCharacter!, pack, t.id, this.isFlaw));
    const fullfilsRestrictions = usedFiltered.filter(t => {
      if (t.restriction) {
        return restrictionResolver.resolve(this.editingCharacter!, t.restriction);
      }
      return true;
    });
    const fullfilsRequirements = fullfilsRestrictions.filter(t => {
      if (t.requirement) {
        if (t.requirement.type === "or") {
          return t.requirement.values.some(r => this.doesTraitExist(this.editingCharacter!, pack, r, this.isFlaw));
        }
      }
      return true;
    });
    return fullfilsRequirements;
  }

  private doesTraitExist(char: ICharacter, selectedPack: ITraitPack, traitId: number, isFlaw: boolean): boolean {
    const exists = (using: IUsingTraitPacks) => {
      const pack = using.packs.find(p => p.pack.id === selectedPack.id);
      if (pack) {
        const traits = isFlaw ? pack.flawTraits : pack.traits;
        if (traits.find(t => t.id === traitId)) {
          return true;
        }
      }
      return false;
    };

    if (selectedPack.type === "merits") {
      return exists(char.merits);
    }

    if (selectedPack.type === "backgrounds") {
      return exists(char.backgrounds);
    }

    return false;
  }

  private getMaxCustomLevel(): number {
    if (!this.selectedTrait) {
      return 0;
    }

    let currentMax = Infinity;

    for (let i = this.selectedTrait.level; i <= 5; i++) {
      if (i > this.pointsLeft) {
        break;
      }
      currentMax = i;
    }

    const change = (val: number) => {
      if (val < currentMax) {
        currentMax = val;
      }
    };
    if (this.selectedTrait.restrictRepeats) {
      if (this.selectedTrait.restrictRepeats.size) {
        if (this.doesTraitExist(this.editingCharacter!, this.selectedPack!, this.selectedTrait.restrictRepeats.size, this.isFlaw)) {
          change(this.selectedTrait.restrictRepeats.amount);
        }
      } else {
        change(this.selectedTrait.restrictRepeats.amount);
      }
    }

    return currentMax;
  }

  private get minCustomLevel(): number {
    return this.selectedTrait!.level;
  }

  private get traits(): ITrait[] {
    return this.filterTraits(this.selectedPack!, [...this.selectedPack![this.isFlaw ? "disadvantages" : "advantages"]]).sort((a, b) => a.name.localeCompare(b.name));
  }

  private get merits(): ITraitPack[] {
    return this.filterTraitPacks([...this.data.merits]).sort((a, b) => a.name.localeCompare(b.name));
  }

  private get backgrounds(): ITraitPack[] {
    return this.filterTraitPacks([...this.data.backgrounds]).sort((a, b) => a.name.localeCompare(b.name));
  }

  private get isReady(): boolean {
    return !!this.selectedPack && !!this.selectedTrait;
  }
}
</script>

<style scoped lang="scss">
$border: 1px solid var(--primary-color) !important;

.trait-pack-content {
  padding-bottom: 1rem;
  display: flex;
  gap: 1rem;
  flex-direction: row;
  $height: 20rem;
  & > div {
    height: $height;
    display: flex;
    flex-direction: column;
    &:not(.border) {
      overflow-x: hidden;
      overflow-y: auto;
    }
    &.traits {
      flex-grow: 1;
      gap: 0.4rem;
      .trait {
        user-select: none;
        cursor: pointer;
        padding: 0.2rem 0.7rem;
        border-radius: 5px;
        font-size: 1.2rem;
        &.selected {
          background-color: rgba(255, 255, 255, 0.2);
        }
        &:not(.selected):hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }
    }
    &.border {
      width: 1px;
      border-left: $border;
    }
    &.info {
      width: 40%;
      &.not-selected {
        justify-content: center;
        align-items: center;
        font-style: italic;
        color: rgba(255, 255, 255, 0.4);
        user-select: none;
      }
    }
  }
}

.optional-trait-options {
  width: 100%;
  border: $border;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  .form-group {
    margin: 0;
  }
}

.form-control.categorized {
  width: fit-content;
  .category {
    text-align: center;
    font-weight: bold;
    color: #fff;
  }
}
</style>